const MapSymbols = {
    location: {
        type: 'picture-marker',
        width: '22px',
        height: '31px',
        yoffset: '16px',
        url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAA1CAYAAADcdMIWAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAVgSURBVHgB7VldTFtlGH47UaY4LCIJJIQdN53LMjPKjU000syIZMasGLLN3dThbvwb9WfxRgUWf0ZiMiAmixGxXMj8QccudK7R0G5guphQjEoA09AuZGDYQlcGWSXL8X3a0+2s9PR8py0NF3uSN6f9+p3zPef93r/vLdFt5AYmyhxmlmoWO8sOFkmRBIKK/MEywOKhDJEJSZBrZnFWbrWYK7fWUFnVwzEpfqDixqTIpZmYTI/7WUZwDSpE2xTyq0IyRq6waIPT8vQes6VuDxXes0H4ZhD2DXxBY0M/yQrRNtF7RUliW09ue2KXVLu/2RC5ZKjITvHXnSSg1TtIHw7W3tdPOQ6XW+0HqeDOQsoGeMHNNU+yaZSXTE+MOq4v/zfBw+OUBUkHP8zV8Nax9dKjVsolyqq2kLT9sbtDf/n2RpeuBinuYGSUpMQaHNj33ufr76/YSKuBInMpVT5iMU3+/msta/QMD82mmrdO4344yWDtC4fMao9dDZRt3EK8Tgl//EFZdwW0NPkxO0k9bDAfQPiKLi2WzAb+hsGfSf49lSYltkOn1f4S5Q8msu5uYqe610m3JoQYUmmyw1K3txoeaARzFyYp9Od5Coyc5TAD05Kp6L5S4fsL7ioktksTgj8laTNVnJxv+uR7YVucu/APefs6kFHCFE9/IYqnyWrOSFLdwXdJ9FnRxQU6/uoz8/xxE0s4MZ683XakOtGHjg39SF+97wgzwRf5K4z/AEsrSwPLgzze1PN2YxjzRMDbTVif4smDtEjaRLcZmcPd/SHe1sLSqzHtS972mrMnusIwB12YTAj02N3dlIbkDniaCNzdH+ACQw/qTJ26trhwxNvXRSIoq3oIl1pKQ1IS2WqluoEWe0kMrukJfzi6tKA7sbg0tr45JyQZoyQOvJBH8dy0UNaX1GPrKAPEQ4yxmjAbJJMU2hLFbqrJGMzwXj1wsRHjoR5LQfIq6QEVDC8IkhKJwGRCFrOhitdD5NJFXIKUhuSoiN0AnJVwOSYw1cTJp2Xb47tIBJHL/+ISUo8lk/QKxTOKk+RwhUNYi87UluKycodYLSAjauB44aU0JIU1Cft67tBREG3lr7jJrvoZIcTGMsgZpKXxnU+FnskcSVn/lsiRde4GkPb4zJJYIPYCSApc7rE8K/ycyNxF6jnciLPPJvV4QYq5vbxgs5FSDUSMkNFCwH8OF0/yeKo4OeB3f0N5hyyT3/0t7HFF/kxF0sNhyIMDfT4R8KMOnYEtrshkWhmnF2fjvOGmFjtT/axF0oW2SL60qRQsQdIoWNLl7s78aFMm36meROslJdKR7MiHNvF8jiZBSlP26VVBb6yqNtkW3d0fpdUioNdmGeeyzMbBWarYvJ1yjbHh09AivPmVdPNE6sk2aFOkhDMCZBd+LrT4vN5cka5akM/DJdeXl625a1rJ5D3RBY9GyNHNHKKVeStnoZw5keIsyNFCjVRRkqiUD/ARNuttjy5G1M4SFrlHZLsTCHK6zHLbZRru/4zbMT5sc7voXUZIAj7ufO3jMsycSc9ybOg0DX93HNu8n+Wa6H1GT4vYngY0BpRjrTBU3ryTBLc5AaOaBGbZ269wo6peuIbkoN3f/jrNz4SOULypZQiZkAR8CPJso5KIfXJupsnzv5zkjy9TBsiUJHAK9slHVTOOuFrAscLb15mwQ0PbnEBGHQwFMfvkoBzWsk/YIRNM2GGQMkQ2mgRgn9HAyLl6HLrU//GAINuhvHTl8pv89WfKAtmSBHxsmybeepvakfrbX0s4ylFaQ3Bxw0B2un6TcaX4Xx5rDmgI+LkZAIJTpPGfzFqAxDJIoo2s28gz/gfm9DACdtjG2wAAAABJRU5ErkJggg==',
    },
    locationMarker: {
        type: 'simple-marker',
        color: [4, 46, 188, 255],
        angle: 0,
        xoffset: 0,
        yoffset: 0,
        size: 12,
        style: 'circle',
        outline: {
            type: 'simple-line',
            color: [0, 0, 0, 0],
            width: 0.75,
            style: 'solid',
        },
    },
    aoi: {
        type: 'simple-fill',
        color: [141, 165, 245, 0.25],
        outline: {
            type: 'simple-line',
            color: [27, 27, 27, 255],
            width: 1.5,
            style: 'solid',
        },
        style: 'none',
    },
    emptyRenderer: {
        type: 'simple',
        symbol: {
            type: 'simple-fill',
            style: 'none',
            outline: {
                style: 'none',
            },
        },
    },
    borderRenderer: {
        type: 'simple',
        symbol: {
            type: 'simple-fill',
            style: 'none',
            outline: {
                type: 'simple-line',
                color: [0, 80, 216], // --color-primary-vivid
                width: 1,
                style: 'solid',
            },
        },
    },
    colors: {
        models: {
            RCP45: {
                background: 'rgba(250, 148, 65, 0.4)',
                border: '#c05600',
            },
            RCP85: {
                background: 'rgba(216, 57, 51, 0.4)',
                border: '#E41D3D',
            },
        },
        historic: {
            background: 'rgba(86, 92, 101, 0.2)',
            border: '#71767A',
        },
    },
};

export default MapSymbols;
