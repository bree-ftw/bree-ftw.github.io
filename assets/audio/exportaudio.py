import json

# Configuration
TPQN = 480  # Ticks per quarter note
MIN_INTERVAL_MS = 150  # Ignore notes closer than this
MAX_BPM = 180  # Cap for overly fast tempos (not used anymore)
KEY_SEQUENCE = ['A', 'W']
MIDI_CSV_PATH = "/Users/vinayak/Library/Mobile Documents/com~apple~CloudDocs/OHS/Clubs:Circles/digital storytelling competition/bree-ftw.github.io/assets/audio/toccatina.csv"
OUTPUT_PATH = "./toccatina2.json"

# Read MIDI CSV and extract events
tempo_changes = []
note_events = []

with open(MIDI_CSV_PATH, "r") as file:
    for line in file:
        parts = [part.strip() for part in line.split(",")]
        track = int(parts[0])
        tick = int(parts[1])
        event_type = parts[2]
        
        if track == 2:
            if event_type == "Tempo":
                # Tempo parsing corrected here
                print("tempo")
                tempo = int(parts[3])  # microseconds per quarter note
                bpm = 60_000_000 / tempo  # Calculate BPM
                print(f"Tick {tick}, Tempo: {bpm:.2f} BPM")  # Debug BPM
                tempo_changes.append((tick, tempo))  # Store tempo change with the corresponding tick

            elif event_type == "Note_on_c" and len(parts) >= 6:
                # Note events processing
                print("n")
                velocity = int(parts[5])
                if velocity > 0:
                    note = int(parts[4])
                    note_events.append({
                        "tick": tick,
                        "note": note,
                        "velocity": velocity
                    })

# Sort tempo changes in case they're not in order
tempo_changes.sort()

# Debug print for tempo map
print("Tempo map:")
for t in tempo_changes:
    print(f"Tick {t[0]} → Tempo {60_000_000 / t[1]:.2f} BPM")

# Convert ticks to milliseconds (with tempo map)
def ticks_to_ms_with_tempos(tick, tempo_changes, tpqn):
    total_ms = 0
    last_tick = 0
    current_tempo = tempo_changes[0][1]  # Start with the first tempo change

    for i in range(1, len(tempo_changes)):
        tempo_tick, tempo_value = tempo_changes[i]
        if tick < tempo_tick:
            break
        duration_ticks = tempo_tick - last_tick
        micros_per_tick = current_tempo / tpqn
        total_ms += duration_ticks * micros_per_tick / 1000
        last_tick = tempo_tick
        current_tempo = tempo_value

    # Final segment from the last tempo change to the given tick
    duration_ticks = tick - last_tick
    micros_per_tick = current_tempo / tpqn
    total_ms += duration_ticks * micros_per_tick / 1000

    return total_ms

# Convert tick to ms
for event in note_events:
    event["time"] = ticks_to_ms_with_tempos(event["tick"], tempo_changes, TPQN)

# Group events into chords (within 10 ms)
note_events.sort(key=lambda e: e["time"])
grouped = []
threshold_ms = 10
current_group = []
last_time = None

for event in note_events:
    if last_time is None or abs(event["time"] - last_time) <= threshold_ms:
        current_group.append(event)
    else:
        grouped.append(current_group)
        current_group = [event]
    last_time = event["time"]
if current_group:
    grouped.append(current_group)

# Reduce each group to the strongest note
filtered = []
for group in grouped:
    if len(group) == 1:
        filtered.append(group[0])
    else:
        strongest = max(group, key=lambda e: (e["velocity"], e["note"]))
        filtered.append(strongest)

# Skip notes that are too close together
final_filtered = []
last_time = None

for event in filtered:
    if last_time is None or event["time"] - last_time >= MIN_INTERVAL_MS:
        final_filtered.append(event)
        last_time = event["time"]

# Assign rhythm game keys based on timing
assigned_rhythms = []
last_time = None
key_index = 0
last_pitch = None
last_key = None

for event in final_filtered:
    time = int(event["time"])
    pitch = event["note"]

    if pitch == last_pitch:
        key = last_key
    else:
        if last_time is None:
            interval = float('inf')
        else:
            interval = time - last_time

        if interval < 200:
            key_index = (key_index + 1) % len(KEY_SEQUENCE)
        elif interval < 500:
            key_index = (key_index + 1) % 3
        else:
            key_index = 0

        key = KEY_SEQUENCE[key_index]

    assigned_rhythms.append({
        "time": time,
        "note": key
    })

    last_time = time
    last_pitch = pitch
    last_key = key

# Export to JSON
rhythm_json = { "rhythms": assigned_rhythms }

with open(OUTPUT_PATH, "w") as f:
    json.dump(rhythm_json, f, indent=2)

print(f"\nRhythm JSON saved to: {OUTPUT_PATH}")
