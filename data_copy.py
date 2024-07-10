import os
import shutil
import pandas as pd
import json

# Load the CSV file
csv_path = r'C:\Users\wuzek\OneDrive\Desktop\drone_interface_final\public\data\task(final) - Sheet1.csv'
data = pd.read_csv(csv_path)
# Define the base path for the data
base_path = r'C:\Users\wuzek\OneDrive\Desktop\drone_interface_final\public\data'
# Define the output base path
output_base_path = r'C:\Users\wuzek\OneDrive\Desktop\drone_interface_final\public\data'  # Set your desired output path here

# Define the output directories relative to the output base path
output_dirs = {
    0: os.path.join(output_base_path, 'no_critical'),
    1: os.path.join(output_base_path, 'critical_situation_1'),
    2: os.path.join(output_base_path, 'critical_situation_2'),
    3: os.path.join(output_base_path, 'critical_situation_3'),
    4: os.path.join(output_base_path, 'critical_situation_4')
}

# Ensure the output directories exist
for dir_name in output_dirs.values():
    os.makedirs(dir_name, exist_ok=True)

# To keep track of the file naming in each output directory
output_counters = {key: 1 for key in output_dirs.keys()}


# Function to determine the critical situation for a segment
def determine_critical_situation(segment):
    for entry in segment:
        if entry["battery"] < 0.1:
            return 1
        if entry["wind"] > 10:
            return 2
        if entry["rotor"] == 0:
            return 3
        if entry["zone"] == 0:
            return 4
    return 0


# Process each JSON file in the specified directories
for task_no in range(1, 7):
    for subfolder in range(1, 5):
        source_path = os.path.join(base_path, str(task_no), str(subfolder), 'data.json')

        if os.path.exists(source_path):
            with open(source_path, 'r') as f:
                data_json = json.load(f)
                timestamps = data_json["timestamps"]

                # Segment the timestamps into chunks of 360
                num_segments = len(timestamps) // 360
                for i in range(num_segments):
                    segment = timestamps[i * 360:(i + 1) * 360]
                    critical_situation = determine_critical_situation(segment)

                    target_file_name = f'{output_counters[critical_situation]:04d}.json'
                    target_path = os.path.join(output_dirs[critical_situation], target_file_name)
                    output_counters[critical_situation] += 1

                    with open(target_path, 'w') as out_f:
                        json.dump({"timestamps": segment}, out_f, indent=4)
        else:
            print(f"Warning: {source_path} does not exist.")

print("File segmenting and copying completed.")