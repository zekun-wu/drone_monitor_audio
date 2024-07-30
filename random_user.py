import pandas as pd
import random
import json
import os

# Set the random seed for reproducibility
random.seed(42)

# Load the CSV file
csv_file_path = 'public/data/task(audio).csv'
data = pd.read_csv(csv_file_path)

# Base path for saving the JSON files
output_json_path = 'public/data/user_trials.json'

# Function to randomize trial numbers within the same task number
def randomize_trials(task_no_group):
    trial_numbers = list(task_no_group['Trial Number'])
    random.shuffle(trial_numbers)
    return trial_numbers

# Dictionary to hold the user trials
user_trials = {}

# Randomize trial numbers for each user and add to the dictionary
for i in range(1, 21):
    randomized_trials = data.groupby('Task No').apply(randomize_trials).reset_index(level=0, drop=True)
    user_trials[f'user{i}'] = randomized_trials.tolist()

# Save the user trials to a single JSON file
with open(output_json_path, 'w') as json_file:
    json.dump(user_trials, json_file, indent=4)

print(f"User trials saved to: {output_json_path}")