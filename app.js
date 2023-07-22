const express = require("express");
const io = require('socket.io');

const app = express();

app.get('/', (req, res) => {
    res.send("Hello! I'm alive")
})
app.get('/socket', (req, res) => {
    res.send("Hello! I'm alive")
})

const server = app.listen(3010, () => "server is connected ...")

const socket = io(server);

const mySocket = socket.of("/socket");


const symbols = [
    "دارا یکم",
    "شپنا",
    "غزر",
    "بگیلان",
    " آبادا",
    " دماوند",
    " ساوه",
    " خودرو",
    " خساپا",
]
const descriptions = [
    "دارا یکم",
    "پالایش نفت",
    "غلات زرماکارون",
    "برق گیلان",
    " آبادا",
    " دماوند",
    " سیمان ساوه",
    " ایران خودرو",
    " سایپا",
]

const randomNumber = (from, range) => {
    return Math.floor(Math.random() * range) + from;
}

const generateStockList = () => {
    const arr = [];
    for (let i = 0; i < 9; i++) {
        const item = {
            symbol: symbols[i],
            description: descriptions[i],
            volume: randomNumber(1, 300),
            lastPrice: randomNumber(1000, 5000),
            lastPricePercent: randomNumber(-5, 10)
        };
        item.value = item.volume * item.lastPrice
        arr.push(item)
    }
    return arr
}

function generateOffers() {
    const arr = [];
    for (let i = 0; i < 10; i++) {
        const item = {
            price: randomNumber(1000, 2000),
            volume: randomNumber(100, 500),
            count: randomNumber(1, 50),
            type: randomNumber(0,2)===0 ?"sell": "buy"
        };
        item.value = item.volume * item.lastPrice
        arr.push(item)
    }
    return arr
};

mySocket.on("connection", (socket) => {
    console.log("new user connected!")

    const balanceInterval = setInterval(() => {
        socket.emit("balance",
            {
                balance: (Math.floor(Math.random() * 9000) + 1000) * 100,
                tavanKharid: (Math.floor(Math.random() * 9000) + 1000) * 100
            })
    }, 2000)

    // For Stock List 
    socket.emit("takeStockList", generateStockList())
    const takeStockListIntervalId = setInterval(() => {
        socket.emit("takeStockList", generateStockList())
    }, 20000)

    socket.on("JoinSaham", saham => {
        socket.join(saham);
    })
    socket.on("leftSaham", saham => {
        socket.leave(saham);
    })

    // User disconnect from server
    socket.on("disconnect", () => {
        console.log("user disconnected ...");
        clearInterval(balanceInterval);
        clearInterval(takeStockListIntervalId);
    })
})


setInterval(() => {
    for (let i = 0; i < symbols.length; i++) {
        mySocket.to(symbols[i]).emit("takeStockDetail", {
            symbol: symbols[i],
            description: descriptions[i],
            volume: randomNumber(1, 300),
            lastPrice: randomNumber(1000, 5000),
            lastPricePercent: randomNumber(-5, 10),
            offers: [
                ...generateOffers()
            ]
        });
    }
}, 4000)


