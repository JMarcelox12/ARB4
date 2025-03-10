import '../../styles/home.css'
export default function Login() {
    return (
        <>
            <link
                href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
                rel="stylesheet"
                integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH"
                crossorigin="anonymous"
            ></link>
            <link rel="stylesheet" href="../../styles/home.css" />
            <head>
                <meta charset="UTF-8" />
                <link rel="icon" type="image/svg+xml" href="/vite.svg" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Home</title>
            </head>
            <body class="bg-dark text-white">
                <script
                    src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
                    integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
                    crossorigin="anonymous"
                ></script>
                <header></header>
                <div class="input">
                    <div class="form-floating mb-3">
                        <input type="email" class="form-control bg-transparent border-success rounded py-2"
                            id="floatingInput" placeholder="name@example.com" />
                        <label for="floatingInput">Email</label>
                    </div>
                    <div class="form-floating">
                        <input type="password" class="form-control bg-transparent border-success rounded yp-2" id="floatingPassword" placeholder="Password" />
                        <label for="floatingPassword">Senha</label>
                    </div>
                </div>
            </body>
        </>
    )
}