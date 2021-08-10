import Web3 from "web3";
import supplyChain from "../../build/contracts/SupplyChain.json";

const App = {
    web3: null,
    contract: null,
    upc: null,

    start: async function () {
        App.registerListeners();
        await App.initWeb3();
        await App.fetchEvents();
    },

    registerListeners: function () {
        document.getElementById("button1").addEventListener("click", App.searchItem);
        document.getElementById("button3").addEventListener("click", App.harvestItem);
        document.getElementById("button4").addEventListener("click", App.processItem);
        document.getElementById("button5").addEventListener("click", App.packItem);
        document.getElementById("button6").addEventListener("click", App.sellItem);
        document.getElementById("button7").addEventListener("click", App.buyItem);
        document.getElementById("button8").addEventListener("click", App.shipItem);
        document.getElementById("button9").addEventListener("click", App.receiveItem);
        document.getElementById("button10").addEventListener("click", App.purchaseItem);
    },

    initWeb3: async function () {
        const {web3} = this;

        try {
            // get contract instance
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = supplyChain.networks[networkId];
            this.contract = new web3.eth.Contract(
                supplyChain.abi,
                deployedNetwork.address,
            );
        } catch (error) {
            console.error("Could not connect to contract or chain.");
        }
    },

    getMetaskAccountID: async function () {
        // Retrieving accounts
        const res = await App.web3.eth.getAccounts();
        App.metamaskAccountID = res[0];
    },

    harvestItem: async function (event) {
        event.preventDefault();
        await App.getMetaskAccountID();

        const {harvestItem} = App.contract.methods;
        try {
            const upc = document.getElementById("upcHarvest").value;
            const farmInfo = document.getElementById("originFarmInformation").value;
            const lati = document.getElementById("originFarmLatitude").value;
            const farmName = document.getElementById("originFarmName").value;
            const longi = document.getElementById("originFarmLongitude").value;
            const notes = document.getElementById("productNotes").value;

            const result = await harvestItem(
                upc,
                App.metamaskAccountID,
                farmName,
                farmInfo,
                lati,
                longi,
                notes
            ).send({from: App.metamaskAccountID});
            await App.clearHarvestForm();

            document.getElementById("upcSearch").value = upc;
            await App.searchItem(null);
            console.log('harvestItem', result);
        } catch (e) {
            console.error(e);
        }
    },

    processItem: async function (event) {
        event.preventDefault();
        await App.getMetaskAccountID();

        const {processItem} = App.contract.methods;
        try {
            const result = await processItem(App.upc
            ).send({from: App.metamaskAccountID});
            console.log('processItem', result);

            document.getElementById("upcSearch").value = App.upc;
            await App.searchItem(null);
        } catch (e) {
            console.error(e);
        }
    },

    packItem: async function (event) {
        event.preventDefault();
        await App.getMetaskAccountID();

        const {packItem} = App.contract.methods;
        try {
            const result = await packItem(App.upc
            ).send({from: App.metamaskAccountID});
            console.log('packItem', result);

            document.getElementById("upcSearch").value = App.upc;
            await App.searchItem(null);
        } catch (e) {
            console.error(e);
        }
    },

    sellItem: async function (event) {
        event.preventDefault();
        await App.getMetaskAccountID();

        const etherPrice = document.getElementById("priceSell").value;
        const productPrice = App.web3.utils.toWei(etherPrice, "ether");
        console.log('productPrice', productPrice);
        const {sellItem} = App.contract.methods;
        try {
            const result = await sellItem(App.upc, productPrice
            ).send({from: App.metamaskAccountID});
            console.log('sellItem', result);

            document.getElementById("upcSearch").value = App.upc;
            await App.searchItem(null);
            document.getElementById("priceSell").value = "";
        } catch (e) {
            console.error(e);
        }
    },

    buyItem: async function (event) {
        event.preventDefault();
        await App.getMetaskAccountID();

        const etherPrice = document.getElementById("priceBuy").value;
        const walletValue = App.web3.utils.toWei(etherPrice, "ether");
        const {buyItem} = App.contract.methods;
        try {
            const result = await buyItem(App.upc
            ).send({from: App.metamaskAccountID, value: walletValue});
            console.log('buyItem', result);

            document.getElementById("upcSearch").value = App.upc;
            await App.searchItem(null);
            document.getElementById("priceBuy").value = "";
        } catch (e) {
            console.error(e);
        }
    },

    shipItem: async function (event) {
        event.preventDefault();
        await App.getMetaskAccountID();

        const {shipItem} = App.contract.methods;
        try {
            const result = await shipItem(App.upc
            ).send({from: App.metamaskAccountID});
            console.log('shipItem', result);

            document.getElementById("upcSearch").value = App.upc;
            await App.searchItem(null);
        } catch (e) {
            console.error(e);
        }
    },

    receiveItem: async function (event) {
        event.preventDefault();
        await App.getMetaskAccountID();

        const {receiveItem} = App.contract.methods;
        try {
            const result = await receiveItem(App.upc
            ).send({from: App.metamaskAccountID});
            console.log('receiveItem', result);

            document.getElementById("upcSearch").value = App.upc;
            await App.searchItem(null);
        } catch (e) {
            console.error(e);
        }
    },

    purchaseItem: async function (event) {
        event.preventDefault();
        await App.getMetaskAccountID();

        const {purchaseItem} = App.contract.methods;
        try {
            const result = await purchaseItem(App.upc
            ).send({from: App.metamaskAccountID});
            console.log('purchaseItem', result);

            document.getElementById("upcSearch").value = App.upc;
            await App.searchItem(null);
        } catch (e) {
            console.error(e);
        }
    },

    searchItem: async function (event) {
        if (event) {
            event.preventDefault();
        }

        const upc = document.getElementById("upcSearch").value;
        if (upc && upc !== 0) {
            App.upc = upc;
            console.log('upc', App.upc);

            await App.fetchItemBufferOne();
            await App.fetchItemBufferTwo();
            await App.updateButtonState();
        }
    },

    fetchItemBufferOne: async function () {
        const {fetchItemBufferOne} = App.contract.methods;
        try {
            const result = await fetchItemBufferOne(App.upc
            ).call();

            if (result && result.itemUPC && result.itemUPC !== "0") {
                document.getElementById("resultSKU").value = result.itemSKU;
                document.getElementById("resultOwnerID").value = result.ownerID;
                document.getElementById("resultOriginFarmerID").value = result.originFarmerID;
                document.getElementById("resultOriginFarmName").value = result.originFarmName;
                document.getElementById("resultOriginFarmInformation").value = result.originFarmInformation;
                document.getElementById("resultOriginFarmLatitude").value = result.originFarmLatitude;
                document.getElementById("resultOriginFarmLongitude").value = result.originFarmLongitude;
            } else {
                this.clearSearchForm();
            }

            console.log('fetchItemBufferOne', result);
        } catch (e) {
            console.error(e);
        }
    },

    fetchItemBufferTwo: async function () {
        const {fetchItemBufferTwo} = App.contract.methods;
        try {
            const result = await fetchItemBufferTwo(App.upc
            ).call();

            if (result && result.itemUPC && result.itemUPC !== "0") {
                document.getElementById("resultOriginProductNotes").value = result.productNotes;
                document.getElementById("resultProductPrice").value = App.web3.utils.fromWei(result.productPrice, "ether");
                document.getElementById("resultDistributorID").value = result.distributorID;
                document.getElementById("resultRetailerID").value = result.retailerID;
                document.getElementById("resultConsumerID").value = result.consumerID;
                document.getElementById("resultState").value = result.itemState;
            } else {

                await this.clearSearchForm();
            }

            console.log('fetchItemBufferTwo', result);
        } catch (e) {
            console.error(e);
        }
    },

    updateButtonState: async function () {
        await App.hideAllButtons();
        const state = parseInt(document.getElementById("resultState").value);
        switch (state) {
            case -1:
                break;
            case 0:
                document.getElementById("group-process").style.display = "block";
                break;
            case 1:
                document.getElementById("group-pack").style.display = "block";

                break;
            case 2:
                document.getElementById("group-sell").style.display = "block";

                break;
            case 3:
                document.getElementById("group-buy").style.display = "block";

                break;
            case 4:
                document.getElementById("group-ship").style.display = "block";

                break;
            case 5:
                document.getElementById("group-receive").style.display = "block";

                break;
            case 6:
                document.getElementById("group-purchase").style.display = "block";

                break;
            default:
                break;
        }
    },

    hideAllButtons: async function () {
        document.getElementById("group-process").style.display = "none";
        document.getElementById("group-pack").style.display = "none";
        document.getElementById("group-sell").style.display = "none";
        document.getElementById("group-buy").style.display = "none";
        document.getElementById("group-ship").style.display = "none";
        document.getElementById("group-receive").style.display = "none";
        document.getElementById("group-purchase").style.display = "none";
    },

    clearSearchForm: async function () {
        document.getElementById("resultOriginProductNotes").value = "";
        document.getElementById("resultProductPrice").value = "";
        document.getElementById("resultDistributorID").value = "";
        document.getElementById("resultRetailerID").value = "";
        document.getElementById("resultConsumerID").value = "";
        document.getElementById("resultState").value = -1;
        document.getElementById("resultSKU").value = "";
        document.getElementById("resultOwnerID").value = "";
        document.getElementById("resultOriginFarmerID").value = "";
        document.getElementById("resultOriginFarmName").value = "";
        document.getElementById("resultOriginFarmInformation").value = "";
        document.getElementById("resultOriginFarmLatitude").value = "";
        document.getElementById("resultOriginFarmLongitude").value = "";
    },

    clearHarvestForm: async function () {
        document.getElementById("upcHarvest").value = "";
        document.getElementById("originFarmInformation").value = "";
        document.getElementById("originFarmLatitude").value = "";
        document.getElementById("originFarmName").value = "";
        document.getElementById("originFarmLongitude").value = "";
        document.getElementById("productNotes").value = "";
    },

    fetchEvents: async function () {
        App.contract.events.allEvents(function (err, log) {
            if (!err) {
                var newLi = document.createElement("li");
                var newContent = document.createTextNode(log.event + ' - ' + log.transactionHash);
                newLi.appendChild(newContent);
                var eventsUl = document.getElementById("ftc-events");
                eventsUl.appendChild(newLi);
            } else {
                console.error(err.message);
            }
        });

    }
};

window.App = App;

window.addEventListener("load", function () {
    if (window.ethereum) {
        // use MetaMask's provider
        App.web3 = new Web3(window.ethereum);
        window.ethereum.enable(); // get permission to access accounts
    } else {
        console.warn(
            "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
        );
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        App.web3 = new Web3(
            new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
        );
    }

    App.start();
});
