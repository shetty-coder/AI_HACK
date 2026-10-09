import os
import requests
import json
import base64

def check_virustotal_url(url, api_key=None):
    if not api_key:
        api_key = os.getenv('VIRUSTOTAL_API_KEY')
        
    if not api_key or api_key.strip() == '':
        return {
            'status': 'SKIPPED_NO_KEY',
            'provider': 'VirusTotal API',
            'message': 'No API key configured. Operating in offline local ML mode.',
            'positives': 0,
            'total': 0
        }

    try:
        # Url identifier for VT v3 API is base64 encoded URL without padding
        url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
        headers = {
            "accept": "application/json",
            "x-apikey": api_key
        }
        res = requests.get(f"https://www.virustotal.com/api/v3/urls/{url_id}", headers=headers, timeout=5)
        if res.status_code == 200:
            data = res.json()
            stats = data.get('data', {}).get('attributes', {}).get('last_analysis_stats', {})
            malicious = stats.get('malicious', 0)
            total = sum(stats.values())
            return {
                'status': 'SUCCESS',
                'provider': 'VirusTotal API v3',
                'malicious_count': malicious,
                'total_engines': total,
                'reputation_score': data.get('data', {}).get('attributes', {}).get('reputation', 0),
                'verdict': 'MALICIOUS' if malicious > 2 else 'CLEAN' if malicious == 0 else 'SUSPICIOUS'
            }
        else:
            return {
                'status': 'API_ERROR',
                'provider': 'VirusTotal API',
                'message': f"HTTP {res.status_code}: {res.text[:100]}"
            }
    except Exception as e:
        return {
            'status': 'NETWORK_ERROR',
            'provider': 'VirusTotal API',
            'message': str(e)
        }

def check_google_safebrowsing(url, api_key=None):
    if not api_key:
        api_key = os.getenv('GOOGLE_SAFEBROWSING_API_KEY')
        
    if not api_key or api_key.strip() == '':
        return {
            'status': 'SKIPPED_NO_KEY',
            'provider': 'Google Safe Browsing API v4',
            'message': 'No API key configured. Operating in offline local ML mode.'
        }
        
    try:
        endpoint = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={api_key}"
        payload = {
            "client": {"clientId": "cybershield-ai-x", "clientVersion": "1.0.0"},
            "threatInfo": {
                "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{"url": url}]
            }
        }
        res = requests.post(endpoint, json=payload, timeout=5)
        if res.status_code == 200:
            matches = res.json().get('matches', [])
            is_malicious = len(matches) > 0
            return {
                'status': 'SUCCESS',
                'provider': 'Google Safe Browsing',
                'is_malicious': is_malicious,
                'matches_count': len(matches),
                'threat_types': [m.get('threatType') for m in matches]
            }
        else:
            return {
                'status': 'API_ERROR',
                'provider': 'Google Safe Browsing',
                'message': f"HTTP {res.status_code}"
            }
    except Exception as e:
        return {
            'status': 'NETWORK_ERROR',
            'provider': 'Google Safe Browsing',
            'message': str(e)
        }
