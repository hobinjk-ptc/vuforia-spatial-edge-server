const apn = require('apn');

const config = {
    key: 'path/to/APNsAuthKey_XXXX.p8',
    keyId: 'key-id',
    teamId: 'dev-team-id',
    appBundleId: 'app-bundle-id',
};

class PushNotifications {
    constructor(objects) {
        this.objects = objects;

        const options = {
            token: {
                key: config.key,
                keyId: config.keyId,
                teamId: config.teamId,
            },
            production: false,
        };

        this.apnProvider = new apn.Provider(options);

        this.knownDeviceKeys = {};
    }

    /**
     * Stores the token for contacting an object locally
     * Persists the device name required for lookup on the object
     * @param {string} objectName
     * @param {string} deviceKey - Key from app notification registration
     */
    registerObject(objectName, deviceKey) {
        let newDeviceName = `device-${objectName}-${Object.keys(this.knownDeviceKeys).length}`;
        this.knownDeviceKeys[newDeviceName] = deviceKey;
        this.objects[objectName].device = newDeviceName;
    }

    /**
     * Send a notification payload to a specific object if supported
     * @param {string} objectName
     * @param {object} payload
     */
    notifyObject(objectName, payload) {
        if (!this.objects.hasOwnProperty(objectName)) {
            console.warn('Not a known object', objectName);
            return false;
        }

        const object = this.objects[objectName];
        if (!object.device) {
            console.warn('No associated device for object', object);
            return false;
        }

        const key = this.knownDeviceKeys[object.device];
        if (!key) {
            console.warn('No key for object\'s device', object);
            return false;
        }

        const notification = new apn.Notification({
            badge: 1,
            alert: {
                title: '',
                subtitle: '',
                body: '',
            },
            payload: payload,
            topic: config.appBundleId,
        });

        return this.apnProvider.send(notification, key);
    }
}

module.exports = PushNotifications;
