from flask import Flask, request
from flask_cors import CORS
import tobii_research as tr
import csv

app = Flask(__name__)
CORS(app)

gaze_data = []
current_task = 0
current_interval = 1

current_timestamp = None
previous_showQuestionnaire = False
previous_calibration = False
previous_allTaskEnded = False

eyetrackers = tr.find_all_eyetrackers()

if not eyetrackers:
    print("No eyetrackers found")
    exit()

my_eyetracker = eyetrackers[0]
print("Using eyetracker: ", my_eyetracker)

gaze_subscribed = False  # <-- Flag to track whether we've already subscribed

def gaze_data_callback(data):
    global current_user, current_task, current_interval, current_timestamp
    # print("Gaze points: ", data['left_gaze_point_on_display_area'], data['right_gaze_point_on_display_area'])
    # print('data',data)
    gaze_data.append({
        'gaze': data,  # use the data received from the callback
        'user':current_user,
        'task': current_task,
        'interval': current_interval,
    })


def write_gaze_data_to_file():
    global gaze_data, current_task, current_interval

    print("Writing gaze data to file")
    file_name = f"gaze_results/gaze_data_{current_task}_{current_interval}.csv"

    try:
        with open(file_name, 'a', newline='') as f:
            writer = csv.writer(f)

            # Check if the file is empty
            if f.tell() == 0:
                # If it is, write the headers
                writer.writerow(["task", "interval", "timestamp", "left_gaze_point_on_display_area",
                                 "right_gaze_point_on_display_area"])  # write headers
            for data in gaze_data:
                writer.writerow([
                    data['task'],
                    data['interval'],
                    data['gaze']['system_time_stamp'],
                    data['gaze']['left_gaze_point_on_display_area'],
                    data['gaze']['right_gaze_point_on_display_area']
                ])
        print(f"Successfully wrote gaze data to {file_name}")
    except Exception as e:
        print(f"Failed to write gaze data to {file_name}")
        print(str(e))

    # Reset gaze data
    gaze_data = []


@app.route('/', methods=['POST'])
def handle_request():
    global gaze_data, gaze_subscribed, current_user, current_task, current_interval, current_timestamp
    global previous_showQuestionnaire, previous_calibration, previous_allTaskEnded

    data = request.get_json()
    current_user = data.get('username')
    new_task = data.get('sceneCounter')  # update the current_task global variable
    new_interval = data.get('interval')   # update the current_interval global variable
    # current_timestamp = data.get('currentIndex')  # update the current_timestamp global variable
    task_started = data.get('taskStarted')
    showQuestionnaire= data.get('showQuestionnaire')
    showMap = data.get('showGridMap')
    rest = data.get('isRestPeriod')
    calibration = data.get('calibration')
    allTaskEnded= data.get('allTaskEnded')

    # print(f"Received taskStarted: {task_started}")

    if task_started and not showQuestionnaire and not showMap and not rest and not calibration and not allTaskEnded and not gaze_subscribed:
        gaze_subscribed = True
        my_eyetracker.subscribe_to(tr.EYETRACKER_GAZE_DATA, gaze_data_callback, as_dictionary=True)
        print("Subscribed to gaze data")
    else:
        gaze_subscribed = False
        my_eyetracker.unsubscribe_from(tr.EYETRACKER_GAZE_DATA, gaze_data_callback)
        print("Unsubscribed from gaze data")

    if new_interval != current_interval and not gaze_subscribed or allTaskEnded:
        print('new_interval', new_interval)
        print('current_interval', current_interval)
        print('new_task', new_task)
        write_gaze_data_to_file()
        current_interval = new_interval
        current_task= new_task


    # if ((showQuestionnaire and not previous_showQuestionnaire) or
    #     (calibration and not previous_calibration) or
    #     (allTaskEnded and not previous_allTaskEnded) or
    #     new_interval != current_interval):
    # if new_interval != current_interval:
    #     write_gaze_data_to_file()
    #     current_interval = new_interval

    return {'status': 'ok'}

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000)

