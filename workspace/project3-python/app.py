import json
import statistics
import tempfile
from datetime import datetime
from pathlib import Path

# Simulated API response (replace with requests.get() for real API)
RAW_DATA = [
    {"city": "Mumbai",    "temp_c": 31.2, "humidity": 82, "wind_kph": 14, "condition": "Humid"},
    {"city": "Delhi",     "temp_c": 22.5, "humidity": 55, "wind_kph": 8,  "condition": "Clear"},
    {"city": "Bangalore", "temp_c": 24.0, "humidity": 70, "wind_kph": 10, "condition": "Cloudy"},
    {"city": "Chennai",   "temp_c": 34.8, "humidity": 78, "wind_kph": 18, "condition": "Sunny"},
    {"city": "Kolkata",   "temp_c": 29.5, "humidity": 88, "wind_kph": 6,  "condition": "Hazy"},
    {"city": "Hyderabad", "temp_c": 27.3, "humidity": 60, "wind_kph": 12, "condition": "Partly Cloudy"},
]

def celsius_to_fahrenheit(c):
    return round((c * 9/5) + 32, 2)

def heat_index(temp_c, humidity):
    """Simplified heat index calculation."""
    t = temp_c
    h = humidity
    hi = -8.78469475556 + 1.61139411*t + 2.33854883889*h \
         - 0.14611605*t*h - 0.012308094*(t**2) \
         - 0.0164248277778*(h**2) + 0.002211732*(t**2)*h \
         + 0.00072546*(t)*(h**2) - 0.000003582*(t**2)*(h**2)
    return round(hi, 2)

def process_data(raw):
    processed = []
    for entry in raw:
        processed.append({
            **entry,
            "temp_f": celsius_to_fahrenheit(entry["temp_c"]),
            "heat_index": heat_index(entry["temp_c"], entry["humidity"]),
            "comfort": "Uncomfortable" if entry["humidity"] > 75 else "Comfortable"
        })
    return processed

def generate_report(data):
    temps = [d["temp_c"] for d in data]
    return {
        "generated_at": datetime.now().isoformat(),
        "total_cities": len(data),
        "stats": {
            "avg_temp_c": round(statistics.mean(temps), 2),
            "max_temp_c": max(temps),
            "min_temp_c": min(temps),
            "std_dev": round(statistics.stdev(temps), 2),
        },
        "hottest_city": max(data, key=lambda x: x["temp_c"])["city"],
        "coolest_city": min(data, key=lambda x: x["temp_c"])["city"],
        "uncomfortable_cities": [d["city"] for d in data if d["comfort"] == "Uncomfortable"],
        "cities": data
    }

def run_tests(data):
    print("\n--- Running Python Tests ---")
    errors = 0

    assert celsius_to_fahrenheit(0) == 32.0,    "0°C should be 32°F"
    assert celsius_to_fahrenheit(100) == 212.0,  "100°C should be 212°F"
    print("  ✅ Temperature conversion tests passed")

    assert len(data) == len(RAW_DATA), "Processed count mismatch"
    assert all("temp_f" in d for d in data),     "Missing temp_f field"
    assert all("heat_index" in d for d in data), "Missing heat_index field"
    print("  ✅ Data processing tests passed")

    report = generate_report(data)
    assert report["hottest_city"] == "Chennai", f"Expected Chennai, got {report['hottest_city']}"
    assert report["coolest_city"] == "Delhi",   f"Expected Delhi, got {report['coolest_city']}"
    print("  ✅ Report generation tests passed")

    return errors

if __name__ == "__main__":
    print("=== Python Weather Processor Started ===\n")

    processed = process_data(RAW_DATA)
    report = generate_report(processed)

    print(f"{'City':<15} {'Temp(C)':>8} {'Temp(F)':>8} {'Humidity':>9} {'Comfort':<15}")
    print("-" * 60)
    for city in processed:
        print(f"{city['city']:<15} {city['temp_c']:>7}°C {city['temp_f']:>7}°F "
              f"{city['humidity']:>8}%  {city['comfort']:<15}")

    print("\n--- Summary ---")
    print(f"Average Temp : {report['stats']['avg_temp_c']}°C")
    print(f"Hottest City : {report['hottest_city']}")
    print(f"Coolest City : {report['coolest_city']}")
    print(f"Uncomfortable: {', '.join(report['uncomfortable_cities'])}")

    report_path = Path(tempfile.gettempdir()) / "weather_report.json"
    with report_path.open("w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print(f"\n📄 Report saved to {report_path}")

    run_tests(processed)
    print("\n=== Python Processor Done ===")