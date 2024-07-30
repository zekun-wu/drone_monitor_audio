import pandas as pd
import os
import json

# Load the CSV file
csv_file_path = r'E:\Gaze_Data\task(final).csv'
data = pd.read_csv(csv_file_path)

# Base path for the JSON data
base_json_path = r'C:\Users\wuzek\OneDrive\Desktop\drone_interface_demo4\public\data'
output_json_path = r'C:\Users\wuzek\OneDrive\Desktop\drone_interface_audio\public\data'


# Function to locate intervals based on the criteria for each Di column
def locate_intervals(task_no, data, di):
    task_data = data[data['Task No'] == task_no]

    with_critical_situation = []
    without_critical_situation = []

    task_data_sorted = task_data.sort_values(by='Interval')

    for i in range(len(task_data_sorted) - 1):
        first_interval = task_data_sorted.iloc[i]
        second_interval = task_data_sorted.iloc[i + 1]

        if first_interval['Interval'] + 1 == second_interval['Interval']:
            if first_interval[di] == 0 and second_interval[di] != 0:
                with_critical_situation.append([second_interval[di],first_interval['Interval'], second_interval['Interval']])
            elif first_interval[di] == 0 and second_interval[di] == 0:
                without_critical_situation.append([second_interval[di],first_interval['Interval'], second_interval['Interval']])

    return with_critical_situation, without_critical_situation


# Function to read and segment the JSON data
def segment_json_data(task_no, di, intervals, json_path, output_folder):
    for interval in intervals:
        critical_situation = interval[0]
        first_interval = interval[1]
        second_interval = interval[2]

        with open(json_path, 'r') as file:
            json_data = json.load(file)

        # Calculate the start and end indices for the JSON data based on the intervals
        start_index_first = (first_interval - 1) * 360
        end_index_first = first_interval * 360
        start_index_second = (second_interval - 1) * 360
        end_index_second = second_interval * 360

        first_interval_data = json_data['timestamps'][start_index_first:end_index_first]
        second_interval_data = json_data['timestamps'][start_index_second:end_index_second]

        # Generate and save the six JSON files
        for i in range(5,11):
            if i == 0:
                combined_data = second_interval_data[:240]
            else:
                combined_data = first_interval_data[-(i * 24):] + second_interval_data[:240]

            # Update the time in the combined data
            for idx, entry in enumerate(combined_data):
                entry['time'] = idx

            # Determine the output path
            if critical_situation:
                critical_output_folder = os.path.join(output_folder, f'critical_situation_{critical_situation}')
                os.makedirs(critical_output_folder, exist_ok=True)
                output_path = os.path.join(critical_output_folder,
                                           f'{task_no}_{first_interval}_{second_interval}_{10 + i}.json')
                print('output_path',output_path)
            else:
                output_path = os.path.join(output_folder, f'{task_no}_{first_interval}_{second_interval}_{10 + i}.json')

            with open(output_path, 'w') as outfile:
                json.dump({'timestamps': combined_data}, outfile, indent=4)
            # print(f"Segmented data saved to: {output_path}")


# Locate and process intervals for each task
for task_no in range(1, 5):
    for di in ['D4']:
        with_critical_situation, without_critical_situation = locate_intervals(task_no, data, di)
        di_index = di[-1]  # Extracting the index (1, 2, 3, or 4)
        json_path = os.path.join(base_json_path, str(task_no), di_index, 'data.json')

        if os.path.exists(json_path):
            # print(f"Processing JSON file: {json_path}")

            # Create directories for output if they don't exist
            non_critical_output_folder = os.path.join(output_json_path, 'without_critical_situation')
            os.makedirs(non_critical_output_folder, exist_ok=True)

            # Process and save data without critical situation
            segment_json_data(task_no, di, without_critical_situation, json_path, non_critical_output_folder)

            # Process and save data with critical situation
            if with_critical_situation:
                segment_json_data(task_no, di, with_critical_situation, json_path, output_json_path)
