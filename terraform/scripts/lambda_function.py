import json

def lambda_handler(event, context):
    # print(1/0) This was the offending code
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }

