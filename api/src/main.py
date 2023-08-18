import logging
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from langchain.callbacks import get_openai_callback
from langchain.chains import LLMChain
from langchain.chat_models import ChatOpenAI
from langchain.output_parsers import CommaSeparatedListOutputParser
from langchain.prompts import PromptTemplate
from langchain.schema import HumanMessage, SystemMessage
from pydantic import BaseModel

app = FastAPI()

PORT_FRONT = os.environ.get("PORT")
origins = [f"http://localhost:{PORT_FRONT}"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryBody(BaseModel):
    text: str

@app.get("/")
def read_root():
    print("Hello World")
    return {"Hello": "World"}

@app.post("/query")
def query(body: QueryBody) -> dict:
    logger = logging.getLogger('uvicorn')
    logger.info(body)
    chat = ChatOpenAI(model_name="gpt-3.5-turbo")
    with get_openai_callback() as cb:
        result = chat(
            [SystemMessage(content="日本語で回答してください。"), HumanMessage(content=body.text)]
        )
        logger.info(cb)
    logger.info(result)
    return {"output": result.content}

class SuggestBody(BaseModel):
    selected_text: str = "興味深い内容だった"
    draft: str = "本公演は生成AIがトピックである。内容は非常に__。次回も参加したい。"
    n: int = 3

@app.post("/suggest")
def suggest(body: SuggestBody) -> dict:
    logger = logging.getLogger('uvicorn')
    
    # 穴埋め問題を解く
    chat = ChatOpenAI(model_name="gpt-3.5-turbo")
    output_parser = CommaSeparatedListOutputParser()
    format_instructions = output_parser.get_format_instructions()
    input_template = """
        {draft}
        上記の文章の__の部分に入る言葉を{n}個出力してください。
        出力は"{selected_text}"の類似したものが望ましいが、完全一致の出力は除外してください。
        {format_instructions}
    """
    input_template_en = """
        {draft}
        Output {n} words that go into the __ part of the above sentence.
        Output should be similar to "{selected_text}".
        {format_instructions}
    """
    prompt = PromptTemplate(
        template=input_template,
        input_variables=["n", "draft", "selected_text"],
        partial_variables={"format_instructions": format_instructions}
    )
    chain = LLMChain(llm=chat, prompt=prompt)
    with get_openai_callback() as cb:
        results = chain.run({"n": body.n, "draft": body.draft, "selected_text": body.selected_text})
        logger.info(cb)
    logger.info("chain run:")
    result_list = output_parser.parse(results)
    logger.info(result_list)

    # 重複を除去
    for option in result_list:
        if option == body.selected_text:
            logger.info(f"remove option: {body.selected_text}")
            result_list.remove(option)

    # draftの文章から__が含まれる文章を抽出
    sentences = body.draft.replace("。", "。\n").split("\n")
    sentences = [s.strip() for s in sentences if s.strip() != ""]
    logger.info("sentences:")
    logger.info(sentences)
    part_draft = ""
    for sentence in sentences:
        if "__" in sentence:
            part_draft = sentence
            break

    # 穴埋め後の文章を作成
    result_num = len(result_list)
    suggest_sentence_list = [""] * result_num
    for i in range(result_num): 
        suggest_sentence_list[i] = part_draft.replace("__", result_list[i])
    logger.info("suggest_sentence_list:")
    logger.info(suggest_sentence_list)
    return {"suggest":results.split(","), "suggest_sentence": suggest_sentence_list}
    