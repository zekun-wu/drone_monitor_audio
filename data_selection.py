import pandas as pd
import os
import shutil
import random

# Load the CSV file
csv_file_path = r'C:\Users\wuzek\OneDrive\Desktop\drone_interface_audio\public\data\task(audio).csv'
data = pd.read_csv(csv_file_path)

# Base path for the JSON data
base_json_path = r'C:\Users\wuzek\OneDrive\Desktop\drone_interface_audio\public\data'
output_base_path = r'C:\Users\wuzek\OneDrive\Desktop\drone_interface_audio\public\data\trials'

# Create output directory if it doesn't exist
if not os.path.exists(output_base_path):
    os.makedirs(output_base_path)


# Function to randomly select a JSON file from a given folder with a specific end number
def select_random_json(folder_path, end_number):
    json_files = [f for f in os.listdir(folder_path) if f.endswith(f'_{end_number}.json')]
    return os.path.join(folder_path, random.choice(json_files))


# Process each row in the CSV file
for index, row in data.iterrows():
    trial_number = f'{int(row["Trial Number"]):04d}'  # Format trial number as four digits
    trial_folder = os.path.join(output_base_path, trial_number)

    # Create trial subfolder if it doesn't exist
    if not os.path.exists(trial_folder):
        os.makedirs(trial_folder)

    # Get the No Critical value
    no_critical = row['No Critical']
    end_number = 10 + no_critical

    print('index',index)
    print('row',row)

    # Select and copy the JSON files for each drone
    for i, di in enumerate(['D1', 'D2', 'D3', 'D4'], start=1):
        if index == 5:
            print('row[di]',row[di])
        if row[di] != 0:
            # Critical situation
            critical_folder = os.path.join(base_json_path, f'critical_situation_{row[di]}')
            selected_json = select_random_json(critical_folder, end_number)
        else:
            # Non-critical situation
            non_critical_folder = os.path.join(base_json_path, 'without_critical_situation')
            selected_json = select_random_json(non_critical_folder, end_number)

        output_json = os.path.join(trial_folder, f'{i}.json')
        shutil.copyfile(selected_json, output_json)
        print(f"Copied {selected_json} to {output_json}")

print("Trial JSON files creation completed.")