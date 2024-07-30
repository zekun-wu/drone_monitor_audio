import csv
import random

# Set the random seed for reproducibility
random.seed(42)

# Define the number of tasks and intervals
num_tasks = 4
num_intervals = 20

# Define the probability distributions
critical_situation_prob = 0.6
critical_situation_types = [1, 2, 3, 4]  # Low battery, extreme wind, rotor off, no-fly zone warning

# Define the alarm and critical situation counts
hits = 10
correct_rejections = 6
false_alarms = 2
misses = 2


# Function to generate critical situations
def generate_critical_situation():
    if random.random() < critical_situation_prob:
        return random.choice(critical_situation_types)
    return 0


# Function to generate AI alarms based on critical situations
def generate_alarm(critical_situation):
    if critical_situation == 0:
        ai_values = ['cj'] * correct_rejections + ['f'] * false_alarms
    else:
        ai_values = ['h'] * hits + ['m'] * misses
    random.shuffle(ai_values)
    return ai_values.pop()


# Function to generate map checks
def generate_map_checks():
    map_checks = [0] * num_intervals
    indices = random.sample(range(num_intervals), k=num_intervals // 5)
    for index in indices:
        map_checks[index] = 1
    return map_checks


# Function to generate questions
def generate_questions():
    questions = [0] * num_intervals
    for i in range(3, num_intervals, 4):
        questions[i] = 1
    return questions


# Initialize the CSV data
csv_data = []

# Generate data for each task
trial_number = 1
for task_no in range(1, num_tasks + 1):
    map_checks = generate_map_checks()
    questions = generate_questions()

    for interval in range(1, num_intervals + 1):
        critical_situation = generate_critical_situation()

        drones_critical = [0, 0, 0, 0]
        drones_alarm = [0, 0, 0, 0]

        if critical_situation > 0:
            drone_with_critical = random.randint(0, 3)
            drones_critical[drone_with_critical] = critical_situation

        if task_no > 1:
            ai = generate_alarm(critical_situation)
            if critical_situation == 0:
                if ai == 'cj':
                    drones_alarm = [0, 0, 0, 0]
                elif ai == 'f':
                    drone_with_alarm = random.randint(0, 3)
                    drones_alarm[drone_with_alarm] = random.choice(critical_situation_types)
            else:
                if ai == 'h':
                    drones_alarm = drones_critical.copy()
                elif ai == 'm':
                    drones_alarm = [0, 0, 0, 0]
        else:
            ai = 'NA'

        no_critical = random.randint(5, 10)

        # Setting the Alarm column based on Task No
        alarm_value = "NA"
        if task_no == 2:
            alarm_value = "V"
        elif task_no == 3:
            alarm_value = "A"
        elif task_no == 4:
            alarm_value = "V/A"

        if task_no == 1:
            drones_alarm = [0, 0, 0, 0]

        if map_checks[interval - 1] == 1 and questions[interval - 1] == 1:
            map_checks[interval - 1] = 0

        row = [
            trial_number,
            task_no,
            interval,
            ai,
            critical_situation,
            *drones_critical,
            *drones_alarm,
            map_checks[interval - 1],
            questions[interval - 1],
            alarm_value,
            no_critical
        ]
        csv_data.append(row)
        trial_number += 1

# Define the CSV column headers
headers = [
    "Trial Number", "Task No", "Interval", "AI", "Critical Situation",
    "D1", "D2", "D3", "D4",
    "A1", "A2", "A3", "A4",
    "Map", "Question", "Alarm", "No Critical"
]

# Write the CSV data to a file
with open('public/data/task(audio).csv', mode='w', newline='') as file:
    writer = csv.writer(file)
    writer.writerow(headers)
    writer.writerows(csv_data)

print("CSV file 'task(audio).csv' generated successfully.")
