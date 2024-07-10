import json

def cut_initial_data(input_path, output_path, seconds_to_cut):
    """
    Cuts the initial data from the JSON file based on the given number of seconds.

    Parameters:
    input_path (str): Path to the input JSON file.
    output_path (str): Path to save the modified JSON file.
    seconds_to_cut (int): Number of seconds to cut from the beginning of the data.

    Returns:
    None
    """
    # Load the JSON data from a file
    with open(input_path, 'r') as file:
        data = json.load(file)

    # Filter out timestamps based on the specified number of seconds
    data['timestamps'] = [timestamp for timestamp in data['timestamps'] if timestamp['time'] < seconds_to_cut*24]

    # Save the modified data back to a JSON file
    with open(output_path, 'w') as file:
        json.dump(data, file, indent=4)

    print(f"Removed timestamps up to {seconds_to_cut} seconds.")

# # Example usage
# cut_initial_data(r'C:\Users\wuzek\OneDrive\Desktop\drone_interface_final\public\data\1\4\data.json',
#                  r'C:\Users\wuzek\OneDrive\Desktop\drone_interface_final\public\data\0\4\data.json',
#                  60)
