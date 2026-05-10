import requests
import logging
from typing import Optional, Dict, Any
from datetime import datetime
import os

logger = logging.getLogger(__name__)

# Firebase config from environment
FIREBASE_PROJECT_ID = os.getenv('VITE_FIREBASE_PROJECT_ID', 'blobis')
FIREBASE_API_KEY = os.getenv('VITE_FIREBASE_API_KEY', '')

class FirestoreClient:
    """Simple Firestore REST API client"""

    def __init__(self):
        self.project_id = FIREBASE_PROJECT_ID
        self.api_key = FIREBASE_API_KEY
        self.base_url = f"https://firestore.googleapis.com/v1/projects/{self.project_id}/databases/(default)/documents"

    def get_document(self, path: str) -> Optional[Dict[str, Any]]:
        """Get a document from Firestore"""
        try:
            url = f"{self.base_url}/{path}"
            response = requests.get(url, params={'key': self.api_key})

            if response.status_code == 404:
                return None

            if response.status_code != 200:
                logger.error(f"Firestore GET error: {response.status_code} - {response.text}")
                return None

            data = response.json()
            return self._parse_document(data)
        except Exception as e:
            logger.error(f"Error getting document {path}: {e}")
            return None

    def set_document(self, path: str, data: Dict[str, Any]) -> bool:
        """Set a document in Firestore"""
        try:
            url = f"{self.base_url}/{path}"
            firestore_data = self._to_firestore_format(data)

            response = requests.patch(
                url,
                json={'fields': firestore_data},
                params={'key': self.api_key}
            )

            if response.status_code not in [200, 201]:
                logger.error(f"Firestore SET error: {response.status_code} - {response.text}")
                return False

            return True
        except Exception as e:
            logger.error(f"Error setting document {path}: {e}")
            return False

    def update_document(self, path: str, data: Dict[str, Any]) -> bool:
        """Update fields in a document"""
        return self.set_document(path, data)

    def _parse_document(self, doc: Dict) -> Dict[str, Any]:
        """Parse Firestore document format to Python dict"""
        if 'fields' not in doc:
            return {}

        result = {}
        for key, value in doc['fields'].items():
            if 'stringValue' in value:
                result[key] = value['stringValue']
            elif 'integerValue' in value:
                result[key] = int(value['integerValue'])
            elif 'doubleValue' in value:
                result[key] = float(value['doubleValue'])
            elif 'booleanValue' in value:
                result[key] = value['booleanValue']
            elif 'timestampValue' in value:
                result[key] = value['timestampValue']
            elif 'mapValue' in value:
                result[key] = self._parse_map(value['mapValue'])

        return result

    def _parse_map(self, map_value: Dict) -> Dict[str, Any]:
        """Parse nested map"""
        if 'fields' not in map_value:
            return {}
        return {k: self._parse_value(v) for k, v in map_value['fields'].items()}

    def _parse_value(self, value: Dict) -> Any:
        """Parse a single value"""
        if 'stringValue' in value:
            return value['stringValue']
        elif 'integerValue' in value:
            return int(value['integerValue'])
        elif 'doubleValue' in value:
            return float(value['doubleValue'])
        elif 'booleanValue' in value:
            return value['booleanValue']
        return None

    def _to_firestore_format(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Python dict to Firestore format"""
        result = {}
        for key, value in data.items():
            if isinstance(value, str):
                result[key] = {'stringValue': value}
            elif isinstance(value, bool):
                result[key] = {'booleanValue': value}
            elif isinstance(value, int):
                result[key] = {'integerValue': str(value)}
            elif isinstance(value, float):
                result[key] = {'doubleValue': value}
            elif isinstance(value, datetime):
                result[key] = {'timestampValue': value.isoformat() + 'Z'}
            elif isinstance(value, dict):
                result[key] = {'mapValue': {'fields': self._to_firestore_format(value)}}

        return result

# Global instance
firestore = FirestoreClient()
