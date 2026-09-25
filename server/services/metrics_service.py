"""
PRAHARI Latency & Telemetry Metrics Service
"""

import time
from collections import defaultdict
from typing import Dict, Any

class MetricsService:
    def __init__(self):
        self.total_requests = 0
        self.total_client_latency_ms = 0.0
        self.total_server_latency_ms = 0.0
        self.total_redactions = 0
        self.redactions_by_category = defaultdict(int)
        self.active_backends = defaultdict(int)
        self.start_time = time.time()

    def record_request(
        self,
        client_latency_ms: float,
        server_latency_ms: float,
        backend_used: str,
        redaction_boxes: list
    ):
        self.total_requests += 1
        self.total_client_latency_ms += client_latency_ms
        self.total_server_latency_ms += server_latency_ms
        self.active_backends[backend_used] += 1

        for box in redaction_boxes:
            self.total_redactions += 1
            category = box.category if hasattr(box, 'category') else box.get('category', 'unknown')
            self.redactions_by_category[category] += 1

    def get_snapshot(self) -> Dict[str, Any]:
        avg_client = (self.total_client_latency_ms / self.total_requests) if self.total_requests > 0 else 0.0
        avg_server = (self.total_server_latency_ms / self.total_requests) if self.total_requests > 0 else 0.0
        avg_e2e = avg_client + avg_server

        return {
            "totalRequests": self.total_requests,
            "uptimeSeconds": round(time.time() - self.start_time, 1),
            "avgClientLatencyMs": round(avg_client, 2),
            "avgServerLatencyMs": round(avg_server, 2),
            "avgEndToEndLatencyMs": round(avg_e2e, 2),
            "totalRedactionsPerformed": self.total_redactions,
            "redactionsByCategory": dict(self.redactions_by_category),
            "activeBackends": dict(self.active_backends),
        }

metrics_service = MetricsService()
