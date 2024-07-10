import numpy as np
import pandas as pd


def create_simulated_data(critical_rate, total_critical_situations, miss_rate, false_alarm_rate,seed):
    if seed is not None:
        np.random.seed(seed)

    # Initialize the DataFrame structure
    tasks = np.repeat(np.arange(1, 5), 25)
    intervals = np.tile(np.arange(1, 26), 4)
    df_simulated = pd.DataFrame({'Task No': tasks, 'Interval': intervals})

    # Generate Critical Situation values
    critical_situations = np.zeros(100, dtype=int)
    num_critical = int(critical_rate * 100)
    critical_indices = np.random.choice(range(100), num_critical, replace=False)

    critical_situation_values = [1, 2, 3, 4]
    critical_counts = [total_critical_situations // 4] * 4

    if sum(critical_counts) < total_critical_situations:
        for i in range(total_critical_situations - sum(critical_counts)):
            critical_counts[i % 4] += 1

    critical_values = []
    for val, count in zip(critical_situation_values, critical_counts):
        critical_values.extend([val] * count)

    np.random.shuffle(critical_values)

    for idx in critical_indices:
        critical_situations[idx] = critical_values.pop()

    df_simulated['Critical Situation'] = critical_situations

    # Generate Alarm values based on the critical situations and probabilities
    alarms = np.zeros(100, dtype=int)
    for i in range(100):
        if critical_situations[i] == 0:
            if np.random.rand() < false_alarm_rate:
                alarms[i] = np.random.choice(critical_situation_values)
        else:
            if np.random.rand() >= miss_rate:
                alarms[i] = critical_situations[i]

    df_simulated['Alarm'] = alarms

    # Distribute Alarm values to drone columns
    drones_alarm = np.zeros((100, 4), dtype=int)
    for i, alarm_value in enumerate(alarms):
        if alarm_value != 0:
            drone_idx = np.random.choice(range(4))
            drones_alarm[i, drone_idx] = alarm_value

    for j in range(4):
        df_simulated[f'D{j + 1}_'] = drones_alarm[:, j]

    # Distribute Critical Situation values to drone columns
    drones_critical = np.zeros((100, 4), dtype=int)
    for i, critical_value in enumerate(critical_situations):
        if critical_value != 0:
            drone_idx = np.random.choice(range(4))
            drones_critical[i, drone_idx] = critical_value

    for j in range(4):
        df_simulated[f'D{j + 1}'] = drones_critical[:, j]

    return df_simulated
# Example usage
critical_rate = 0.5
total_critical_situations = 80
miss_rate = 0.2
false_alarm_rate = 0.1

seed = 42

simulated_data = create_simulated_data(critical_rate, total_critical_situations, miss_rate, false_alarm_rate, seed)

# Save the simulated data to a CSV file
output_path = r'public/data/alarm_high.csv'
simulated_data.to_csv(output_path, index=False)