import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain.callbacks import get_openai_callback
from langchain.chains import LLMChain
from langchain.chat_models import ChatOpenAI
from langchain.output_parsers import CommaSeparatedListOutputParser
from langchain.prompts import PromptTemplate
from langchain.schema import HumanMessage, SystemMessage

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
    logger = logging.getLogger('uvicorn')
    logger.info(text)
    chat = ChatOpenAI(model_name="gpt-3.5-turbo")
    with get_openai_callback() as cb:
        result = chat(
            [SystemMessage(content="日本語で回答してください。"), HumanMessage(content=text)]
        )
        logger.info(cb)

    logger.info(result)
    return {"output": result.content}

@app.post("/suggest")
def suggest(selected_text: str="訓練", sentence: str="ITの利活用には、__が必要です。", n:int=3):
    logger = logging.getLogger('uvicorn')
    
    # 穴埋め問題を解く
    chat = ChatOpenAI(model_name="gpt-3.5-turbo")
    output_parser = CommaSeparatedListOutputParser()
    format_instructions = output_parser.get_format_instructions()
    prompt = PromptTemplate(
        template="__の部分に{selected_text}に代わる言葉を{n}個出力してください。 {sentence}\n{format_instructions}",
        input_variables=["n", "sentence", "selected_text"],
        partial_variables={"format_instructions": format_instructions}
    )
    chain = LLMChain(llm=chat, prompt=prompt)
    with get_openai_callback() as cb:
        results = chain.run({"n": n, "sentence": sentence, "selected_text": selected_text})
        logger.info(cb)
    print(results)

    # 穴埋め後の文章を作成
    suggest_sentence_list = [""] * n    
    result_list = [x.strip() for x in results.split(',')]
    for i in range(n):
        suggest_sentence_list[i] = sentence.replace("__", result_list[i])
    return {"suggest":results, "suggest_sentence": suggest_sentence_list}
    