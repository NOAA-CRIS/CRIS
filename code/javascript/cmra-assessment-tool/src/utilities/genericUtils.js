import { request } from '@esri/arcgis-rest-request';

// Helper method to quickly GET a resource
function get(url, params) {
    return new Promise((resolve, reject) => {
        request(url, { httpMethod: 'GET', params: params })
            .then((response) => resolve(response))
            .catch((error) => reject(error));
    });
}

export async function getConfig() {
    const config = await get(process.env.PUBLIC_URL + '/config.json').then(
        (response) => response,
        (error) => error
    );
    return config;
}
