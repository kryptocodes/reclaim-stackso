# Reclaim - Stack.so Demo 


This is demo project for using Reclaim with Stack.so. 

## Getting Started

### Prerequisites
Get your reclaim APP_ID and APP_SECRET from [Reclaim Protocol Devtool](https://dev.reclaimprotocol.org) and Stack.so API key from [Stack.so](https://stack.so/)


### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/kryptocodes/reclaim-stackso.git
    ```
2. Install NPM packages
    ```sh
    npm install
    ```
3. Create a .env file in the root directory and add the following
    ```sh
    cp .env.example .env
    ```
    ```sh
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID = <WALLET_CONNECT_PROJECT_ID>
    NEXT_PUBLIC_APP_ID = <APP_ID>
    NEXT_PUBLIC_APP_SECRET = <APP_SECRET>
    NEXT_PUBLIC_STACK_API_KEY = <STACK_API_KEY>
    ```
4. Run the development server
    ```sh
    npm run dev
    ```
5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.



