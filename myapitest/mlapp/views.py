from django.shortcuts import render

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

# Example ML model function (replace with your actual model)
def predict(input_data):
    # Add your ML model prediction logic here
    data1=input_data["data"]
    data2=data1 +" " + " well done "
    result = {"prediction": data2 ,
              "negative":30,
              "positive":50,
              "neutral":20}  # Replace with actual prediction
    return result

@csrf_exempt  # Use this if you're testing with POST requests from non-Django clients
def predict_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            prediction = predict(data)
            return JsonResponse(prediction, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Only POST requests are allowed'}, status=405)
