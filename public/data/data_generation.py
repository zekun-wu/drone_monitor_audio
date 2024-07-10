import os
import json
import pandas as pd
import random
import shutil

# Load the CSV file
csv_path = r'C:\Users\wuzek\OneDrive\Desktop\drone_interface_final\public\data\alarm_high.csv'
data = pd.read_csv(csv_path)

# Define the base path for the data
base_path = r'C:\Users\wuzek\OneDrive\Desktop\drone_interface_final\public\data'

# Define the input and output base paths
output_base_path = base_path
input_dirs = {
    0: os.path.join(output_base_path, 'no_critical'),
    1: os.path.join(output_base_path, 'critical_situation_1'),
    2: os.path.join(output_base_path, 'critical_situation_2'),
    3: os.path.join(output_base_path, 'critical_situation_3'),
    4: os.path.join(output_base_path, 'critical_situation_4')
}

# Ensure the output directories exist
for task_no in range(5):
    for subfolder in range(1, 5):  # 1, 2, 3, 4
        output_dir = os.path.join(base_path, str(task_no), str(subfolder))
        os.makedirs(output_dir, exist_ok=True)


# Helper function to load a random JSON file from a given directory
def load_random_json(directory):
    files = [f for f in os.listdir(directory) if f.endswith('.json')]
    if not files:
        return None
    selected_file = random.choice(files)
    with open(os.path.join(directory, selected_file), 'r') as f:
        return json.load(f)


# Process each task interval
for task_no in range(5):
    for subfolder in range(1, 5):  # D1, D2, D3, D4 columns
        combined_data = []
        for _, row in data[data['Task No'] == task_no].iterrows():
            d_value = row[f'D{subfolder}']
            if d_value in input_dirs:
                input_dir = input_dirs[d_value]
            else:
                input_dir = input_dirs[0]

            sampled_json = load_random_json(input_dir)
            if sampled_json:
                combined_data.extend(sampled_json["timestamps"])

        # Update the time values to be sequential
        for idx, entry in enumerate(combined_data):
            entry['time'] = idx

        # Save the combined data to the output path
        output_path = os.path.join(base_path, str(task_no), str(subfolder), 'data.json')
        with open(output_path, 'w') as f:
            json.dump({"timestamps": combined_data}, f, indent=4)

print("Combined JSON files created successfully.")