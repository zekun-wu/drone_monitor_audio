import json
import random

# Load the JSON data
with open(r'C:\Users\wuzek\OneDrive\Desktop\drone_interface_audio\public\data\user_trials.json', 'r') as file:
    data = json.load(file)

# Function to randomize the last three sets for each user with a random seed
# Function to shuffle sets[1], sets[2], and sets[3] without shuffling their internal values
def shuffle_sets(data, seed):
    random.seed(seed)
    for user, sets in data.items():
        sets_to_shuffle = sets[1:4]
        random.shuffle(sets_to_shuffle)
        data[user] = [sets[0]] + sets_to_shuffle
    return data


# Apply the function to the data with a set seed
seed = 42
randomized_data = shuffle_sets(data, seed)

# Save the randomized data back to a JSON file
output_path = 'user_trials.json'
with open(output_path, 'w') as file:
    json.dump(randomized_data, file, indent=4)