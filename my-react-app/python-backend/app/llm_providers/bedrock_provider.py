import json
import os
from typing import Any

import boto3
from botocore.exceptions import BotoCoreError, ClientError


class BedrockProviderError(Exception):
    """Raised when Amazon Bedrock generation fails."""


DEFAULT_BEDROCK_MODEL_ID = "amazon.nova-lite-v1:0"


def _get_bedrock_client():
    region = os.getenv("AWS_REGION", "us-east-1")

    return boto3.client(
        service_name="bedrock-runtime",
        region_name=region,
    )


def _extract_text_from_response(model_id: str, response_body: dict[str, Any]) -> str:
    """
    Handles common Bedrock response shapes.

    Amazon Nova models usually return:
    {
      "output": {
        "message": {
          "content": [
            {"text": "..."}
          ]
        }
      }
    }

    Anthropic Claude-style responses usually return:
    {
      "content": [
        {"text": "..."}
      ]
    }
    """

    if "output" in response_body:
        content = (
            response_body.get("output", {})
            .get("message", {})
            .get("content", [])
        )

        text_parts = [
            item.get("text", "")
            for item in content
            if isinstance(item, dict) and item.get("text")
        ]

        if text_parts:
            return "\n".join(text_parts).strip()

    if "content" in response_body:
        content = response_body.get("content", [])

        text_parts = [
            item.get("text", "")
            for item in content
            if isinstance(item, dict) and item.get("text")
        ]

        if text_parts:
            return "\n".join(text_parts).strip()

    raise BedrockProviderError(
        f"Unable to extract text from Bedrock response for model {model_id}."
    )


def generate_grounded_answer_with_bedrock(prompt: str) -> str:
    model_id = os.getenv("BEDROCK_MODEL_ID", DEFAULT_BEDROCK_MODEL_ID)
    client = _get_bedrock_client()

    request_body = {
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "text": prompt,
                    }
                ],
            }
        ],
        "inferenceConfig": {
            "maxTokens": 700,
            "temperature": 0.2,
            "topP": 0.9,
        },
    }

    try:
        response = client.invoke_model(
            modelId=model_id,
            body=json.dumps(request_body),
            contentType="application/json",
            accept="application/json",
        )

        raw_body = response["body"].read()
        response_body = json.loads(raw_body)

        answer = _extract_text_from_response(
            model_id=model_id,
            response_body=response_body,
        )

        if not answer:
            raise BedrockProviderError("Bedrock returned an empty answer.")

        return answer

    except (BotoCoreError, ClientError, KeyError, json.JSONDecodeError) as exc:
        raise BedrockProviderError(str(exc)) from exc
