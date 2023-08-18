from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain.chat_models import ChatOpenAI
from langchain.output_parsers import CommaSeparatedListOutputParser
from langchain.prompts import PromptTemplate
from langchain.schema import HumanMessage, SystemMessage
from langchain.chains import LLMChain

app = FastAPI()

origins = ["http://localhost:50018"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    print("Hello World")
    return {"Hello": "World"}

@app.post("/query")
def query(text: str) -> dict:
    print(text)
    chat = ChatOpenAI(model_name="gpt-3.5-turbo")
    
    result = chat([
        SystemMessage(content="日本語で回答してください。"),
        HumanMessage(content=text),
    ])
    print(result)
    return {"output": result.content}

@app.post("/suggest")
def suggest(selected_text: str="訓練", sentence: str="ITの利活用には、__が必要です。", n:int=3):
    chat = ChatOpenAI(model_name="gpt-3.5-turbo")
    output_parser = CommaSeparatedListOutputParser()
    format_instructions = output_parser.get_format_instructions()
    prompt = PromptTemplate(
        template="__に入る言葉を{n}個出力してください。{sentence}\n{format_instructions}",
        input_variables=["n", "sentence"],
        partial_variables={"format_instructions": format_instructions}
    )
    chain = LLMChain(llm=chat, prompt=prompt, )
    results = chain.run({"n": n, "sentence": sentence})
    print(results)
    return {"suggest":results}
    