from fastapi import FastAPI
from pydantic import BaseModel
from Analyser import analyser
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
obj = analyser()
# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5501"],  # Adjust this to your frontend's origin port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputData(BaseModel):
    input_text: str

class OutputData(BaseModel):
    sentiment: str
    negative: float
    neutral: float
    positive: float

@app.post("/api", response_model=OutputData)
async def process_input(data: InputData):
    # Process the input data
    sentiment, prob_dist = obj.get_response(text=data.input_text)
    # Return the processed output as a dictionary
    return {
        'sentiment': sentiment,
        'negative': prob_dist['negative'],
        'neutral': prob_dist['neutral'],
        'positive': prob_dist['positive']
    }
