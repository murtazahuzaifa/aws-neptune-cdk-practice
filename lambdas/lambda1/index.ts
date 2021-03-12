//https://docs.aws.amazon.com/neptune/latest/userguide/access-graph-gremlin-node-js.html
//https://docs.aws.amazon.com/neptune/latest/userguide/lambda-functions-examples.html

import { APIGatewayProxyEvent, APIGatewayProxyResult, Callback, Context } from 'aws-lambda';
// import { driver, process as gprocess, structure } from 'gremlin';
// import * as async from 'async';
import { g, gremlinQueryHandler, __ } from './gremlinQueryHandler';


export const handler = async (event: APIGatewayProxyEvent, context: Context, callback: Callback) => {
    const { body } = event;
    const { name, age } = body as any;
    let result = {};

    await gremlinQueryHandler(async () => {
        result = await g
            .V()
            .elementMap()
            .next()

        console.log("Result", result);
        // return event
        // callback(null, result);
        // return { message: 'success', ...result }

    })

    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
    };


}

/*
declare var process: {
    env: {
        NEPTUNE_ENDPOINT: string
    }
}

let conn: driver.DriverRemoteConnection;
let g: gprocess.GraphTraversalSource;
const { t, P: { }, } = gprocess;
const __ = gprocess.statics;


const doQuery = (event: APIGatewayProxyEvent) => async () => {
    const { body } = event;
    const { name, age } = body as any;
    // const { name, age } = JSON.parse(body || "{}") as any;
    let result = await g
        // .V()
        .addV("person")
        // .property(t.id, id)
        .property("name", name)
        .property("age", Number(age))
        // .count()
        // .has("name", "Abbas")
        // .values()
        // .group()
        // .by(t.label).by("name")
        // .groupCount()
        // .by(t.label)
        // .values('name', 'age')
        // .limit(100)
        // .values('name', 'age')
        // .project('id','name')
        // .hasLabel('person')
        .elementMap()
        // .values()
        // .toList()
        .next()

    console.log("Result", result);

    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(result),
    };
}



export async function handler(event: APIGatewayProxyEvent, context: Context) {

    const getConnectionDetails = () => {
        const database_url = 'wss://' + process.env.NEPTUNE_ENDPOINT + ':8182/gremlin';
        return { url: database_url, headers: {} };
    };

    const createRemoteConnection = () => {
        const { url, headers } = getConnectionDetails();

        return new driver.DriverRemoteConnection(
            url,
            {
                mimeType: 'application/vnd.gremlin-v2.0+json',
                pingEnabled: false,
                headers: headers
            });
    };

    const createGraphTraversalSource = (conn: driver.DriverRemoteConnection) => {
        return gprocess.traversal().withRemote(conn);
    };

    if (conn == null) {
        conn = createRemoteConnection();
        g = createGraphTraversalSource(conn);
    }



    return async.retry(
        {
            times: 5,
            interval: 1000,
            errorFilter: function (err) {

                // Add filters here to determine whether error can be retried
                console.warn('Determining whether retriable error: ' + err.message);

                // Check for connection issues
                if (err.message.startsWith('WebSocket is not open')) {
                    console.warn('Reopening connection');
                    conn.close();
                    conn = createRemoteConnection();
                    g = createGraphTraversalSource(conn);
                    return true;
                }

                // Check for ConcurrentModificationException
                if (err.message.includes('ConcurrentModificationException')) {
                    console.warn('Retrying query because of ConcurrentModificationException');
                    return true;
                }

                // Check for ReadOnlyViolationException
                if (err.message.includes('ReadOnlyViolationException')) {
                    console.warn('Retrying query because of ReadOnlyViolationException');
                    return true;
                }

                return false;
            }

        },
        doQuery(event)
    );



}
*/