import React from "react";
// import io from "socket.io-client";
import {
  Container,
  Row,
  Col,
  Table,
  Form,
  Accordion,
  Button,
  ButtonGroup,
  InputGroup,
  FormControl,
  ToastContainer,
  Toast,
  Spinner,
} from "react-bootstrap";
import { getWallet, getList, getPrice, buy, sell } from "./api/requestAPI";

function Trading() {
  const [wallet, setWallet] = React.useState([]);
  const [apiKey, setApiKey] = React.useState("");
  const [apiSecret, setApiSecret] = React.useState("");
  const [list, setList] = React.useState([]);
  const [selectSymbol, setSelectSymbol] = React.useState("");
  const [info, setInfo] = React.useState("");
  const [select, setSelect] = React.useState("buy");
  const [selectmarket, setSelectMarket] = React.useState(false);
  const [persent, setPersent] = React.useState(25);
  const [price, setPrice] = React.useState(0);
  const [inputValue1, setInputValue1] = React.useState(0);
  const [inputValue2, setInputValue2] = React.useState(0);
  const [inputValue3, setInputValue3] = React.useState(0);
  const [opentotrade, setopentrade] = React.useState(true);
  const [diableInput, setDiableInput] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [loader, setLoader] = React.useState(false);
  const [error, setError] = React.useState({
    show: false,
    headermsg: "",
    message: "",
  });

  const getData = async () => {
    setLoader(true);
    const response = await getWallet(apiSecret, apiKey);
    if (response) {
      setWallet(response);
      setopentrade(false);
      setDiableInput(true);
      setError({
        show: true,
        headermsg: "Success",
        message: "Successfully get wallet",
      });
    } else {
      setError({
        show: true,
        message: "Please check your API key and secret",
        headermsg: "Error !!",
      });
    }
    setLoader(false);
  };

  const fetchData = async () => {
    setLoader(true);
    const response = await getWallet(apiSecret, apiKey);
    // console.log(response);
    setWallet(response);
    setInputValue1(0);
    setInputValue2(0);
    setInputValue3(0);
    setLoader(false);
  };

  const setListCoin = async () => {
    const data = await getList();
    setList(data);
  };

  const onClickSelectCoin = async (symbol, information) => {
    setSelectSymbol(symbol);
    setInfo(information);
    await funcSetPrice(symbol, persent, select, selectmarket);
    var element = document.getElementById("trade");
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });
  };

  const selectPersent = async (persent) => {
    setPersent(persent);
    await funcSetPrice(selectSymbol, persent, select, selectmarket);
  };

  const changeInputVal = async (value, index) => {
    if (index === 0) {
      if (select === "buy") {
        const thai_baht_fill = wallet.filter((item) => item[0] === "THB");
        const thai_baht = thai_baht_fill.length > 0 ? thai_baht_fill[0][1] : 0;
        if (thai_baht < value) {
          setError({
            show: true,
            message: "Your THB is not enough",
            headermsg: "Error !!",
          });
        } else {
          setInputValue3(value / inputValue2);
          setInputValue1(value);
        }
      } else {
        const selectCoin = selectSymbol.split("_")[1];
        const coin_wallet = wallet.filter((item) => item[0] === selectCoin);
        const coin_wallet_value =
          coin_wallet.length > 0 ? coin_wallet[0][1] : 0;
        if (coin_wallet_value < value) {
          setError({
            show: true,
            message: "Your " + selectCoin + " is not enough",
            headermsg: "Error !!",
          });
        } else {
          setInputValue3(value * price);
          setInputValue1(value);
        }
      }
    } else if (index === 1) {
      if (select === "buy") {
        setInputValue3(inputValue1 / value);
        setInputValue2(value);
      } else {
        setInputValue3(value * price);
        setInputValue2(value);
      }
    } else if (index === 2) {
      setInputValue3(value);
    }
  };

  const setSelectpush = async (select) => {
    setSelect(select);
    await funcSetPrice(selectSymbol, persent, select, selectmarket);
  };

  const setSelectMarketpush = async (market) => {
    setSelectMarket(market);
    await funcSetPrice(selectSymbol, persent, select, market);
  };

  const funcSetPrice = async (symbol, percent, select, selectmarket) => {
    const pricedata = await getPrice(selectSymbol);
    setPrice(pricedata.last);
    const lastprice = pricedata.last;
    const selectCoin = symbol.split("_")[1];
    if (select === "buy") {
      const thai_baht_fill = wallet.filter((item) => item[0] === "THB");
      const thai_baht = thai_baht_fill.length > 0 ? thai_baht_fill[0][1] : 0;
      if (selectmarket) {
        setInputValue1((thai_baht * percent) / 100);
        setInputValue2(0);
        setInputValue3((thai_baht * percent) / 100 / lastprice);
      } else {
        setInputValue1((thai_baht * percent) / 100);
        setInputValue2(lastprice);
        setInputValue3((thai_baht * percent) / 100 / lastprice);
      }
    } else {
      const coin_wallet = wallet.filter((item) => item[0] === selectCoin);
      if (coin_wallet.length === 0) {
        setInputValue1(0);
        setInputValue2(0);
        setInputValue3(0);
      } else {
        const coin_wallet_amount = coin_wallet[0][1];
        if (selectmarket) {
          setInputValue1((coin_wallet_amount * percent) / 100);
          setInputValue2(0);
          setInputValue3(((coin_wallet_amount * percent) / 100) * lastprice);
        } else {
          setInputValue1((coin_wallet_amount * percent) / 100);
          setInputValue2(lastprice);
          setInputValue3(((coin_wallet_amount * percent) / 100) * lastprice);
        }
      }
    }
  };

  const onClickToTrade = async () => {
    if (select === "buy") {
      const status = await buy(
        selectSymbol,
        apiSecret,
        apiKey,
        selectmarket ? "market" : "limit",
        inputValue1,
        inputValue2
      );
      //   console.log(status);
      if (status) {
        await fetchData();
        setError({
          show: true,
          message: "Successfully buy",
          headermsg: "Success !!",
        });
        await fetchData();
      } else {
        setError({
          show: true,
          message: "fail to buy",
          headermsg: "Error !!",
        });
      }
    } else {
      const status = await sell(
        selectSymbol,
        apiSecret,
        apiKey,
        selectmarket ? "market" : "limit",
        inputValue1,
        inputValue2
      );
      //   console.log(status);
      if (status) {
        setError({
          show: true,
          message: "Successfully sell",
          headermsg: "Success !!",
        });
        await fetchData();
      } else {
        setError({
          show: true,
          message: "fail to sell",
          headermsg: "Error !!",
        });
      }
    }
  };

  React.useEffect(() => {
    if (list.length === 0) {
      setListCoin();
    }
  });

  React.useEffect(() => {
    if (apiKey === "" || apiSecret === "") {
      setError({
        show: true,
        message: "Please enter API Key and API Secret",
        headermsg: "Error !!",
      });
    }
  }, [apiKey, apiSecret]);

  return (
    <Container fluid className="mt-4">
      <Row>
        <Col>
          <Accordion defaultActiveKey="0" alwaysOpen>
            <Accordion.Item eventKey="0">
              <Accordion.Header>Setting</Accordion.Header>
              <Accordion.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Api Key</Form.Label>
                  <Form.Control
                    placeholder="Api Key"
                    onChange={(e) => {
                      setApiKey(e.target.value);
                    }}
                    disabled={diableInput}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Sercet Key</Form.Label>
                  <Form.Control
                    placeholder="Sercet Key"
                    onChange={(e) => {
                      setApiSecret(e.target.value);
                    }}
                    disabled={diableInput}
                  />
                </Form.Group>
                {!diableInput && (
                  <Button
                    disabled={diableInput}
                    type="submit"
                    onClick={getData}
                  >
                    Submit
                  </Button>
                )}
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>Wallet</Accordion.Header>
              <Accordion.Body>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr className="text-center">
                      <th>Coin</th>
                      <th>available</th>
                      <th>reserved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallet.map((item) => (
                      <tr className="text-center">
                        <td>{item[0]}</td>
                        <td>{item[1]}</td>
                        <td>{item[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                {!loader ? (
                  <Button
                    type="submit"
                    variant="light"
                    onClick={fetchData}
                    className="w-100"
                  >
                    Refresh Data
                  </Button>
                ) : (
                  <div className="mx-auto" style={{ width: "10%" }}>
                    <Spinner animation="border" />
                  </div>
                )}
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="2">
              <Accordion.Header>Select Coin</Accordion.Header>
              <Accordion.Body className="overflow-auto mh-500px">
                <InputGroup className="mb-3">
                  <InputGroup.Text id="basic-addon3">
                    search coin
                  </InputGroup.Text>
                  <FormControl
                    id="basic-url"
                    aria-describedby="basic-addon3"
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr className="text-center">
                      <th>Coin</th>
                      <th>info</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {list
                      .filter((item) =>
                        search === ""
                          ? item
                          : item.symbol
                              .toLowerCase()
                              .includes(search.toLowerCase()) && item
                      )
                      .map((item) => (
                        <tr className="text-center">
                          <td>{item.symbol}</td>
                          <td>{item.info}</td>
                          <td>
                            <Button
                              variant="dark"
                              onClick={() => {
                                onClickSelectCoin(item.symbol, item.info);
                              }}
                              disabled={opentotrade}
                            >
                              select
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
      </Row>
      {selectSymbol === "" ? (
        <h2 className="text-center mt-4">Select coin to trade</h2>
      ) : (
        <>
          <Row className="mt-2">
            <Col>
              <h5>
                {info} : {price}
              </h5>
            </Col>
          </Row>
          <Row>
            <Col>
              <ButtonGroup aria-label="Basic example" className="w-100">
                <Button
                  variant={select === "buy" ? "success" : "secondary"}
                  onClick={() => setSelectpush("buy")}
                >
                  Buy
                </Button>
                <Button
                  variant={select === "sell" ? "danger" : "secondary"}
                  onClick={() => setSelectpush("sell")}
                >
                  Sell
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
          <Row className="mt-2" id="trade">
            <Col>
              <ButtonGroup aria-label="Basic example" className="w-100">
                <Button
                  className="w-50"
                  variant={selectmarket ? "info" : "primary"}
                  onClick={() => setSelectMarketpush(false)}
                >
                  Limit
                </Button>
                <Button
                  className="w-50"
                  variant={!selectmarket ? "info" : "primary"}
                  onClick={() => setSelectMarketpush(true)}
                >
                  Market
                </Button>
              </ButtonGroup>
            </Col>
            <Col>
              <ButtonGroup aria-label="Basic example" className="w-100">
                <Button
                  variant={persent === 25 ? "primary" : "info"}
                  onClick={() => selectPersent(25)}
                >
                  25%
                </Button>
                <Button
                  variant={persent === 50 ? "primary" : "info"}
                  onClick={() => selectPersent(50)}
                >
                  50%
                </Button>
                <Button
                  variant={persent === 75 ? "primary" : "info"}
                  onClick={() => selectPersent(75)}
                >
                  75%
                </Button>
                <Button
                  variant={persent === 100 ? "primary" : "info"}
                  onClick={() => selectPersent(100)}
                >
                  100%
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
          <Row className="mt-2">
            <Col>
              <InputGroup>
                <InputGroup.Text className="w-25">
                  {select === "buy"
                    ? "เงินที่ต้องการจ่าย"
                    : "เหรียญที่ต้องการขาย"}
                </InputGroup.Text>
                <FormControl
                  aria-label="Amount (to the nearest dollar)"
                  className="text-center"
                  value={inputValue1}
                  onChange={(e) => changeInputVal(e.target.value, 0)}
                  type="number"
                />
                <InputGroup.Text className="w-25">
                  {selectSymbol.split("_")[select === "buy" ? 0 : 1]}
                </InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
          {!selectmarket && (
            <Row className="mt-1">
              <Col>
                <InputGroup>
                  <InputGroup.Text className="w-25">
                    {select === "buy" ? "ราคาซื้อ" : "ราคาขาย"}
                  </InputGroup.Text>
                  <FormControl
                    aria-label="Amount (to the nearest dollar)"
                    className="text-center"
                    value={selectmarket ? 0 : inputValue2}
                    onChange={(e) => changeInputVal(e.target.value, 1)}
                    disabled={selectmarket}
                    type="number"
                  />
                  <InputGroup.Text className="w-25">
                    {selectSymbol.replace("_", "/")}
                  </InputGroup.Text>
                </InputGroup>
              </Col>
            </Row>
          )}

          <Row className="mt-1">
            <Col>
              <InputGroup>
                <InputGroup.Text className="w-25">
                  {select === "buy" ? "เหรียญที่จะได้รับ" : "เงินที่จะได้รับ"}
                </InputGroup.Text>
                <FormControl
                  aria-label="Amount (to the nearest dollar)"
                  className="text-center"
                  value={(selectmarket ? "≈" : "") + `${inputValue3}`}
                  onChange={(e) => changeInputVal(e.target.value, 2)}
                  disabled
                />
                <InputGroup.Text className="w-25">
                  {selectSymbol.split("_")[select === "buy" ? 1 : 0]}
                </InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
          <Row>
            <Col>
              <ButtonGroup
                aria-label="Basic example"
                className="w-100 mt-2 mb-4"
              >
                <Button
                  onClick={onClickToTrade}
                  variant={select === "buy" ? "success" : "danger"}
                >
                  {select}
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
        </>
      )}
      <ToastContainer
        className="p-3 fixed"
        position="top-end"
        style={{ zIndex: 9999 }}
      >
        <Toast
          show={error.show}
          onClose={() =>
            setError({
              show: false,
              message: "",
              headermsg: "",
            })
          }
        >
          <Toast.Header>
            <strong className="me-auto">{error.headermsg}</strong>
          </Toast.Header>
          <Toast.Body>{error.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </Container>
  );
}

export default Trading;
