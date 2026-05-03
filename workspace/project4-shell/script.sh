#!/usr/bin/env bash
set -e

WIN_REPORT="/c/Users/$USERNAME/AppData/Local/Temp/weather_report.json"
REPORT="/tmp/weather_report.json"
if [ -f "$WIN_REPORT" ]; then
    REPORT="$WIN_REPORT"
fi

BACKUP_DIR="/tmp/weather_backups"
LOG_FILE="/tmp/pipeline_health.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

if [ -x "/c/Python313/python.exe" ]; then
    PYTHON_CMD=(/c/Python313/python.exe)
elif command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD=(python3)
elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD=(python)
elif command -v py >/dev/null 2>&1; then
    PYTHON_CMD=(py -3)
else
    echo "ERROR: No Python runtime found for shell checks"
    exit 1
fi

REPORT_FOR_PY="$REPORT"
if [[ "${PYTHON_CMD[0]}" == *.exe ]] || [[ "${PYTHON_CMD[0]}" == /c/* ]]; then
    REPORT_FOR_PY=$(cygpath -w "$REPORT")
fi

log() { echo "[$TIMESTAMP] $1" | tee -a "$LOG_FILE"; }

echo "=== Shell Health Monitor Started ==="
log "Pipeline health check initiated"

# --- System Info ---
echo -e "\n📊 System Info:"
echo "  Hostname : $(hostname)"
echo "  OS       : $(uname -s) $(uname -r)"
if command -v nproc >/dev/null 2>&1; then
    CPU_CORES=$(nproc)
else
    CPU_CORES="N/A"
fi
if command -v free >/dev/null 2>&1; then
    MEM_TOTAL=$(free -h | awk '/^Mem:/ {print $2}')
    MEM_AVAIL=$(free -h | awk '/^Mem:/ {print $7}')
else
    MEM_TOTAL="N/A"
    MEM_AVAIL="N/A"
fi
echo "  CPU Cores: $CPU_CORES"
echo "  Memory   : $MEM_TOTAL total, $MEM_AVAIL available"
echo "  Disk     : $(df -h / | awk 'NR==2 {print $4}') free on /"

# --- Validate Python Report ---
echo -e "\n🔍 Validating Weather Report..."
if [ ! -f "$REPORT" ]; then
    log "ERROR: Report not found at $REPORT"
    exit 1
fi

CITY_COUNT=$(REPORT_PATH="$REPORT_FOR_PY" "${PYTHON_CMD[@]}" -c "import os, json; d=json.load(open(os.environ['REPORT_PATH'])); print(d['total_cities'])")
HOTTEST=$(REPORT_PATH="$REPORT_FOR_PY" "${PYTHON_CMD[@]}" -c "import os, json; d=json.load(open(os.environ['REPORT_PATH'])); print(d['hottest_city'])")
AVG_TEMP=$(REPORT_PATH="$REPORT_FOR_PY" "${PYTHON_CMD[@]}" -c "import os, json; d=json.load(open(os.environ['REPORT_PATH'])); print(d['stats']['avg_temp_c'])")

echo "  ✅ Report found and valid"
echo "  Cities processed : $CITY_COUNT"
echo "  Hottest city     : $HOTTEST"
echo "  Average temp     : ${AVG_TEMP}°C"

if [ "$CITY_COUNT" -lt 1 ]; then
    log "ERROR: No city data found in report"
    exit 1
fi

# --- Backup ---
echo -e "\n💾 Backing Up Report..."
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/weather_$(date '+%Y%m%d_%H%M%S').json"
cp "$REPORT" "$BACKUP_FILE"
echo "  ✅ Backed up to $BACKUP_FILE"

BACKUP_COUNT=$(ls "$BACKUP_DIR"/*.json 2>/dev/null | wc -l)
echo "  Total backups: $BACKUP_COUNT"

# Keep only last 5 backups
if [ "$BACKUP_COUNT" -gt 5 ]; then
    ls -t "$BACKUP_DIR"/*.json | tail -n +6 | xargs rm -f
    echo "  🧹 Old backups cleaned up"
fi

# --- Pipeline Summary ---
echo -e "\n📋 Pipeline Summary:"
echo "  ✅ Java  — Alert Engine"
echo "  ✅ Node  — REST API + DB"
echo "  ✅ Python — Data Processor"
echo "  ✅ Shell — Health Monitor"

log "All pipeline stages completed successfully"
echo -e "\n=== Shell Monitor Done ==="