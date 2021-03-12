import { driver, process as gprocess } from 'gremlin';
import * as async from 'async';

declare var process: {
    env: {
        NEPTUNE_ENDPOINT?: string
    }
}

let conn: driver.DriverRemoteConnection;
export let g: gprocess.GraphTraversalSource;
export const { t, P, } = gprocess;
export const __ = gprocess.statics;

export async function gremlinQueryHandler(queryHandler: () => Promise<any>) {

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
        queryHandler
    );



}