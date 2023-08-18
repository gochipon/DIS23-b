from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage
from pydantic import BaseModel

app = FastAPI()

origins = ["http://localhost:50010"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryBody(BaseModel):
    text:str

@app.get("/")
def read_root():
    print("Hello World")
    return {"Hello": "World"}

@app.post("/query")
def query(body: QueryBody) -> dict:
    print(type(body))
    chat = ChatOpenAI(model_name="gpt-3.5-turbo")

    result = chat([
        SystemMessage(content="日本語で回答してください。"),
        HumanMessage(content=body.text),
    ])
    print(result)
    return {"output": result.content}

@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}
    