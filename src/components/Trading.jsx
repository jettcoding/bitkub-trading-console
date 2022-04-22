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
import {
  getWallet,
  getList,
  getPrice,
  buy,
  sell,
  orderList,
  deleteOrder,
} from "./api/requestAPI";

function Trading() {
  var formatter = new Intl.NumberFormat("en-US");
  const [wallet, setWallet] = React.useState([]);
  const [apiKey, setApiKey] = React.useState("");
  const [apiSecret, setApiSecret] = React.useState("");
  const [list, setList] = React.useState([]);
  const [openOrderList, setopenOrderList] = React.useState([]);
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
  const [orderListLoader, setOrderListLoader] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [loader, setLoader] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const [colorPrimary, setColorPrimary] = React.useState("");
  const [colorSecondary, setColorSecondary] = React.useState("");
  const [colorSuccess, setColorSuccess] = React.useState("");
  const [colorDanger, setColorDanger] = React.useState("");
  const [colorSelected, setColorSelected] = React.useState("");
  const [colorUnselected, setColorUnselected] = React.useState("");
  const [colorBar, setColorBar] = React.useState("");
  const [image, setImage] = React.useState("");
  const [showImage, setShowImage] = React.useState(
    "https://firebasestorage.googleapis.com/v0/b/event-web-a0b1c.appspot.com/o/images%2F1627892719605_1920x1080-ghost-white-solid-color-background.jpg?alt=media&token=8bd6db46-0085-4386-a486-cb2390e807d8"
  );
  const [error, setError] = React.useState({
    show: false,
    headermsg: "",
    message: "",
  });
  // eslint-disable-next-line
  const setImageBg = async (img = "") => {
    if (img !== "") {
      setImage(img);
      setShowImage(img);
      localStorage.setItem("image", img);
    } else {
      setShowImage(image);
      localStorage.setItem("image", image);
    }
  };

  const setColor = (color) => {
    if (color.primary) {
      setColorPrimary(color.primary);
      document
        .querySelector("html")
        .style.setProperty("--primary-color", color.primary);
      localStorage.setItem("primary-color", color.primary);
    }
    if (color.secondary) {
      setColorSecondary(color.secondary);
      document
        .querySelector("html")
        .style.setProperty("--secondary-color", color.secondary);
      localStorage.setItem("secondary-color", color.secondary);
    }
    if (color.success) {
      setColorSuccess(color.success);
      document
        .querySelector("html")
        .style.setProperty("--success-color", color.success);
      localStorage.setItem("success-color", color.success);
    }
    if (color.danger) {
      setColorDanger(color.danger);
      document
        .querySelector("html")
        .style.setProperty("--danger-color", color.danger);
      localStorage.setItem("danger-color", color.danger);
    }
    if (color.selected) {
      setColorSelected(color.selected);
      document
        .querySelector("html")
        .style.setProperty("--selected-color", color.selected);
      localStorage.setItem("selected-color", color.selected);
    }
    if (color.unselected) {
      setColorUnselected(color.unselected);
      document
        .querySelector("html")
        .style.setProperty("--unselected-color", color.unselected);
      localStorage.setItem("unselected-color", color.unselected);
    }
    if (color.bar) {
      setColorBar(color.bar);
      document
        .querySelector("html")
        .style.setProperty("--bar-color", color.bar);
      localStorage.setItem("bar-color", color.bar);
    }
  };

  const getData = async (apiSecret = "", apiKey = "") => {
    setLoader(true);
    localStorage.setItem("apiSecret", apiSecret);
    localStorage.setItem("apiKey", apiKey);
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
    await setOrderList(symbol);
    var element = document.getElementById("trade");
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "start",
    });
  };

  const setOrderList = async (symbol) => {
    setOrderListLoader(true);
    const data = await orderList(apiSecret, apiKey, symbol);
    setopenOrderList(data);
    setOrderListLoader(false);
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
        await setOrderList(selectSymbol);
        setError({
          show: true,
          message: "Successfully buy",
          headermsg: "Success !!",
        });
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
        await setOrderList(selectSymbol);
        await fetchData();
        setError({
          show: true,
          message: "Successfully sell",
          headermsg: "Success !!",
        });
      } else {
        setError({
          show: true,
          message: "fail to sell",
          headermsg: "Error !!",
        });
      }
    }
  };

  const resetUser = async () => {
    localStorage.removeItem("apiSecret");
    localStorage.removeItem("apiKey");
    setApiKey("");
    setApiSecret("");
    setWallet([]);
    setopentrade(true);
    setDiableInput(false);
  };

  const cancleOrder = async (hash) => {
    const status = await deleteOrder(apiSecret, apiKey, hash);
    if (status) {
      await setOrderList(selectSymbol);
      await getData(apiSecret, apiKey);
      setError({
        show: true,
        message: "Successfully cancle order",
        headermsg: "Success !!",
      });
    } else {
      setError({
        show: true,
        message: "fail to cancle order",
        headermsg: "Error !!",
      });
    }
  };

  React.useEffect(() => {
    if (list.length === 0) {
      setListCoin();
    }
  });

  React.useEffect(() => {
    if (
      colorPrimary === "" &&
      colorSecondary === "" &&
      colorSuccess === "" &&
      colorDanger === ""
    ) {
      const check_color_primary = localStorage.getItem("primary-color");
      const check_color_secondary = localStorage.getItem("secondary-color");
      const check_color_success = localStorage.getItem("success-color");
      const check_color_danger = localStorage.getItem("danger-color");
      const check_color_selected = localStorage.getItem("selected-color");
      const check_color_unselected = localStorage.getItem("unselected-color");
      const check_color_bar = localStorage.getItem("bar-color");
      const check_image = localStorage.getItem("image");
      if (
        check_color_primary !== null &&
        check_color_secondary !== null &&
        check_color_success !== null &&
        check_color_danger !== null &&
        check_color_selected !== null &&
        check_color_unselected !== null &&
        check_color_bar !== null &&
        check_color_primary !== "" &&
        check_color_secondary !== "" &&
        check_color_success !== "" &&
        check_color_danger !== "" &&
        check_color_selected !== "" &&
        check_color_unselected !== "" &&
        check_color_bar !== ""
      ) {
        setColor({
          primary: check_color_primary,
          secondary: check_color_secondary,
          success: check_color_success,
          danger: check_color_danger,
          selected: check_color_selected,
          unselected: check_color_unselected,
          bar: check_color_bar,
        });
      } else {
        setColor({
          primary: "#ffffff",
          secondary: "#ffffff",
          success: "#ffffff",
          danger: "#ffffff",
          selected: "#ffffff",
          unselected: "#ffffff",
          bar: "#ffffff",
        });
      }
      if (check_image !== null && check_image !== "") {
        setImageBg(check_image);
      } else {
        setImageBg();
      }
    }
  }, [
    colorPrimary,
    colorSecondary,
    colorSuccess,
    colorDanger,
    image,
    setImageBg,
  ]);

  React.useEffect(() => {
    if (apiKey === "" || apiSecret === "") {
      const check_api = localStorage.getItem("apiKey");
      const check_api_secret = localStorage.getItem("apiSecret");
      if (
        check_api !== null &&
        check_api_secret !== null &&
        check_api_secret !== "" &&
        check_api !== ""
      ) {
        setApiKey(check_api);
        setApiSecret(check_api_secret);
        getData(check_api_secret, check_api);
      } else {
        setError({
          show: true,
          message: "Please enter API Key and API Secret",
          headermsg: "Error !!",
        });
      }
    }
  }, [apiKey, apiSecret]);

  if (
    colorPrimary === "" &&
    colorSecondary === "" &&
    colorSuccess === "" &&
    colorDanger === ""
  ) {
    return <div></div>;
  }

  return (
    <div
      style={{ backgroundImage: `url("${showImage}")`, minHeight: "100vh" }}
      className="bg-full"
    >
      <Container fluid className="pt-4">
        <Row>
          <Col>
            <Accordion defaultActiveKey="0" alwaysOpen>
              <Accordion.Item eventKey="0">
                <Accordion.Header>Theme Setting</Accordion.Header>
                <Accordion.Body>
                  <Row>
                    <Col>
                      <Form.Label htmlFor="exampleColorInput">
                        Primary
                      </Form.Label>
                      <Form.Control
                        type="color"
                        id="exampleColorInput"
                        defaultValue={colorPrimary}
                        value={colorPrimary}
                        onChange={(e) => setColorPrimary(e.target.value)}
                        title="Choose your color"
                        className="w-100"
                      />
                    </Col>
                    <Col>
                      <Form.Label htmlFor="exampleColorInput">
                        Secondary
                      </Form.Label>
                      <Form.Control
                        type="color"
                        id="exampleColorInput"
                        defaultValue={colorSecondary}
                        onChange={(e) => setColorSecondary(e.target.value)}
                        value={colorSecondary}
                        title="Choose your color"
                        className="w-100"
                      />
                    </Col>
                    <Col>
                      <Form.Label htmlFor="exampleColorInput">Buy</Form.Label>
                      <Form.Control
                        type="color"
                        id="exampleColorInput"
                        defaultValue={colorSuccess}
                        onChange={(e) => setColorSuccess(e.target.value)}
                        value={colorSuccess}
                        title="Choose your color"
                        className="w-100"
                      />
                    </Col>
                    <Col>
                      <Form.Label htmlFor="exampleColorInput">Sell</Form.Label>
                      <Form.Control
                        type="color"
                        id="exampleColorInput"
                        defaultValue={colorDanger}
                        onChange={(e) => setColorDanger(e.target.value)}
                        value={colorDanger}
                        title="Choose your color"
                        className="w-100"
                      />
                    </Col>
                  </Row>
                  <Row className="mt-2">
                    <Col>
                      <Form.Label htmlFor="exampleColorInput">
                        Selected
                      </Form.Label>
                      <Form.Control
                        type="color"
                        id="exampleColorInput"
                        defaultValue={colorSelected}
                        onChange={(e) => setColorSelected(e.target.value)}
                        value={colorSelected}
                        title="Choose your color"
                        className="w-100"
                      />
                    </Col>
                    <Col>
                      <Form.Label htmlFor="exampleColorInput">
                        Unselected
                      </Form.Label>
                      <Form.Control
                        type="color"
                        id="exampleColorInput"
                        defaultValue={colorUnselected}
                        onChange={(e) => setColorUnselected(e.target.value)}
                        value={colorUnselected}
                        title="Choose your color"
                        className="w-100"
                      />
                    </Col>
                    <Col>
                      <Form.Label htmlFor="exampleColorInput">Bar</Form.Label>
                      <Form.Control
                        type="color"
                        id="exampleColorInput"
                        defaultValue={colorBar}
                        onChange={(e) => setColorBar(e.target.value)}
                        value={colorBar}
                        title="Choose your color"
                        className="w-100"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col className="w-100 mt-2">
                      <Form.Label htmlFor="inputPassword5">
                        Url background image
                      </Form.Label>
                      <Form.Control
                        type="text"
                        id="inputPassword5"
                        aria-describedby="passwordHelpBlock"
                        onChange={(e) => setImage(e.target.value)}
                        defaultValue={image}
                        value={image}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col className="mt-4">
                      <Button
                        variant="primary"
                        className="w-100"
                        onClick={() => {
                          setImageBg(image);
                          setColor({
                            primary: colorPrimary,
                            secondary: colorSecondary,
                            success: colorSuccess,
                            danger: colorDanger,
                            selected: colorSelected,
                            unselected: colorUnselected,
                            bar: colorBar,
                          });
                        }}
                        active
                      >
                        Save
                      </Button>
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Setting</Accordion.Header>
                <Accordion.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Api Key</Form.Label>
                    <Form.Control
                      placeholder="Api Key"
                      onChange={(e) => {
                        setApiKey(e.target.value);
                      }}
                      value={apiKey}
                      disabled={diableInput}
                      type={show ? "text" : "password"}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Sercet Key</Form.Label>
                    <Form.Control
                      placeholder="Sercet Key"
                      onChange={(e) => {
                        setApiSecret(e.target.value);
                      }}
                      value={apiSecret}
                      disabled={diableInput}
                      type={show ? "text" : "password"}
                    />
                  </Form.Group>
                  <Row>
                    <Col>
                      <Button
                        active
                        variant="primary"
                        className="w-100"
                        onClick={() => setShow(!show)}
                      >
                        Show setting
                      </Button>
                    </Col>
                    <Col>
                      {!loader ? (
                        !diableInput ? (
                          <Button
                            active
                            disabled={diableInput}
                            className="w-100"
                            onClick={() => getData(apiSecret, apiKey)}
                            variant="success"
                          >
                            Submit
                          </Button>
                        ) : (
                          <Button
                            active
                            variant="danger"
                            className="w-100"
                            onClick={resetUser}
                          >
                            Reset
                          </Button>
                        )
                      ) : (
                        <div className="mx-auto" style={{ width: "10%" }}>
                          <Spinner animation="border" />
                        </div>
                      )}
                    </Col>
                  </Row>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
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
                          <td>{formatter.format(item[1])}</td>
                          <td>{formatter.format(item[2])}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {!loader ? (
                    <Button
                      active
                      variant="primary"
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
              <Accordion.Item eventKey="3">
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
                                active
                                variant="info"
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
              <Accordion.Item eventKey="4">
                <Accordion.Header>
                  Order {selectSymbol.split("_")[1]}
                </Accordion.Header>
                {openOrderList.length > 0 ? (
                  <Accordion.Body>
                    <Table striped bordered hover size="sm">
                      <thead>
                        <tr className="text-center">
                          <th>Side</th>
                          <th>Type</th>
                          <th>Rate</th>
                          <th>Amount</th>
                          <th>Fee</th>
                          <th>time</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {openOrderList.map((item) => (
                          <tr className="text-center">
                            <td>{item.side}</td>
                            <td>{item.type}</td>
                            <td>{formatter.format(item.rate)}</td>
                            <td>{formatter.format(item.amount)}</td>
                            <td>{item.fee}</td>
                            <td>{formatter.format(item.receive)}</td>
                            <td>
                              <Button
                                active
                                variant="danger"
                                onClick={() => {
                                  cancleOrder(item.hash);
                                }}
                                disabled={opentotrade}
                              >
                                cancle
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                    {orderListLoader ? (
                      <div className="mx-auto" style={{ width: "10%" }}>
                        <Spinner animation="border" />
                      </div>
                    ) : (
                      <Button
                        active
                        variant="primary"
                        onClick={() => setOrderList(selectSymbol)}
                        className="w-100 mt-4"
                      >
                        Refresh Orders
                      </Button>
                    )}
                  </Accordion.Body>
                ) : (
                  <Accordion.Body>
                    <h5 className="text-center">No open order</h5>
                  </Accordion.Body>
                )}
              </Accordion.Item>
            </Accordion>
          </Col>
        </Row>
        <Row>
          <Col className="bg-white m-2 p-2 rounded-3">
            {selectSymbol === "" ? (
              <h2 className="text-center mt-4">Select coin to trade</h2>
            ) : (
              <>
                <Row className="mt-2">
                  <Col>
                    <h5>
                      {info} : {formatter.format(price)}
                    </h5>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <ButtonGroup aria-label="Basic example" className="w-100">
                      <Button
                        active
                        variant={select === "buy" ? "success" : "unselected"}
                        onClick={() => setSelectpush("buy")}
                      >
                        Buy
                      </Button>
                      <Button
                        active
                        variant={select === "sell" ? "danger" : "unselected"}
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
                        active
                        className="w-50"
                        variant={selectmarket ? "unselected" : "selected"}
                        onClick={() => setSelectMarketpush(false)}
                      >
                        Limit
                      </Button>
                      <Button
                        active
                        className="w-50"
                        variant={!selectmarket ? "unselected" : "selected"}
                        onClick={() => setSelectMarketpush(true)}
                      >
                        Market
                      </Button>
                    </ButtonGroup>
                  </Col>
                  <Col>
                    <ButtonGroup aria-label="Basic example" className="w-100">
                      <Button
                        active
                        variant={persent === 25 ? "selected" : "unselected"}
                        onClick={() => selectPersent(25)}
                      >
                        25%
                      </Button>
                      <Button
                        active
                        variant={persent === 50 ? "selected" : "unselected"}
                        onClick={() => selectPersent(50)}
                      >
                        50%
                      </Button>
                      <Button
                        active
                        variant={persent === 75 ? "selected" : "unselected"}
                        onClick={() => selectPersent(75)}
                      >
                        75%
                      </Button>
                      <Button
                        active
                        variant={persent === 100 ? "selected" : "unselected"}
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
                        type="text"
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
                          type="text"
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
                        {select === "buy"
                          ? "เหรียญที่จะได้รับ"
                          : "เงินที่จะได้รับ"}
                      </InputGroup.Text>
                      <FormControl
                        aria-label="Amount (to the nearest dollar)"
                        className="text-center"
                        value={
                          (selectmarket ? "≈" : "") +
                          `${formatter.format(inputValue3)}`
                        }
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
                        active
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
          </Col>
        </Row>

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
    </div>
  );
}

export default Trading;
