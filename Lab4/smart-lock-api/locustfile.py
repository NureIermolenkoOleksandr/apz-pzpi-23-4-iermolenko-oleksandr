import uuid
import random
from locust import HttpUser, task, between

class SmartLockWebUser(HttpUser):
    wait_time = between(1, 3)
    token = None

    def on_start(self):
     
        self.email = f"user_{uuid.uuid4().hex[:8]}@test.com"
        self.password = "secure123"
        self.full_name = "Locust Test User"

        register_payload = {
            "email": self.email,
            "password": self.password,
            "fullName": self.full_name,
            "role": "TENANT"
        }
        with self.client.post("/api/auth/register", json=register_payload, catch_response=True) as response:
            if response.status_code in [200, 201]:
                response.success()
            else:
                response.failure(f"Registration failed with status {response.status_code}")

        login_payload = {
            "email": self.email,
            "password": self.password
        }
        with self.client.post("/api/auth/login", json=login_payload, catch_response=True) as response:
            if response.status_code == 200:
                json_data = response.json()
                self.token = json_data.get("token")
                response.success()
            else:
                response.failure("Login failed")

    @task(2)
    def view_devices(self):
        if not self.token:
            return
        headers = {"Authorization": f"Bearer {self.token}"}
   
        category = random.choice(["", "?category=SMART_LOCK"])
        self.client.get(f"/api/devices{category}", headers=headers, name="/api/devices")

    @task(1)
    def check_dashboard(self):
        if not self.token:
            return
        headers = {"Authorization": f"Bearer {self.token}"}
        self.client.get("/api/dashboard", headers=headers, name="/api/dashboard")