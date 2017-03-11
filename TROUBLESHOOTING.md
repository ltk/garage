# Troubleshooting

We'll document common problems here

## Unable to connect to network in Android emulator

You might experience network connectivity issues accessing `localhost`
in the android emulator. The solution for this is to update your
`.env` configuration so that the `API_HOST` variable reads:

```
API_URL=http://10.0.2.2:8000
```
