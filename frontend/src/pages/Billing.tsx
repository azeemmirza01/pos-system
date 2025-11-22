import { useState, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Table,
  Typography,
  Space,
  InputNumber,
  message,
  Empty,
  Image,
  Tag,
  Divider,
} from "antd";
import {
  SearchOutlined,
  ShoppingCartOutlined,
  DeleteOutlined,
  PlusCircleOutlined,
  MinusCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import usePosStore from "../stores/usePosStore";
import type { Product, CartItem } from "../types";
import imageService from "../services/imageService";
import { formatCurrency, getCurrencySymbol } from "../utils/currency";

const { Text } = Typography;
const { Option } = Select;

export default function Billing() {
  const {
    products,
    cart,
    customers,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    createSale,
    currency,
  } = usePosStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [cartImages, setCartImages] = useState<Record<string, string>>({});

  // Load product images
  useEffect(() => {
    const loadProductImages = async () => {
      const imageMap: Record<string, string> = {};
      for (const product of products) {
        if (product.image_url) {
          try {
            const imageUrl = await imageService.getImageUrl(product.image_url);
            if (imageUrl) {
              imageMap[product.id] = imageUrl;
            }
          } catch (error) {
            console.error(`Error loading image for product ${product.id}:`, error);
          }
        }
      }
      setProductImages(imageMap);
    };
    loadProductImages();
  }, [products]);

  // Load cart item images
  useEffect(() => {
    const loadCartImages = async () => {
      const imageMap: Record<string, string> = {};
      for (const item of cart) {
        if (item.image_url) {
          try {
            const imageUrl = await imageService.getImageUrl(item.image_url);
            if (imageUrl) {
              imageMap[item.product_id] = imageUrl;
            }
          } catch (error) {
            console.error(`Error loading image for cart item ${item.product_id}:`, error);
          }
        }
      }
      setCartImages(imageMap);
    };
    loadCartImages();
  }, [cart]);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.barcode?.includes(searchQuery)
  );

  const subtotal = cart.reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0
  );
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax - discount;

  const handleAddToCart = async (product: Product) => {
    if (product.stock <= 0) {
      message.warning("Product is out of stock");
      return;
    }
    addToCart(product);
    message.success(`${product.name} added to cart`);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      message.warning("Cart is empty");
      return;
    }

    setIsProcessing(true);
    try {
      const sale = {
        customer_id: selectedCustomer || null,
        payment_method: paymentMethod,
        discount: discount,
        tax: tax,
      };

      await createSale(sale);
      message.success("Sale completed successfully!");
      setSelectedCustomer(null);
      setDiscount(0);
      setPaymentMethod("cash");
    } catch (error) {
      console.error("Error creating sale:", error);
      message.error("Error creating sale. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const cartColumns = [
    {
      title: "Product",
      key: "product",
      render: (_: any, record: CartItem) => (
        <Space >
          {cartImages[record.product_id] ? (
            <Image
              width={50}
              height={50}
              src={cartImages[record.product_id]}
              alt={record.product_name}
              style={{ objectFit: "cover", borderRadius: 6 }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29A2MDQH6CxKbQvYPAJ0loxlHQKMdAwMOQwUJxQUlqO4oZQwz8ewMbG0ZBNxBiSgMDA7uP//8syDgOaBQd1f//P8f///9+IMDg/8PAwMBmAFAFQJ0LmnKjXQAAAFZlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA5KGAAcAAAASAAAARKACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAABBU0NJSQAAAFNjcmVlbnNob3Q5V0xEAAAB1mlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNi4wLjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgoZXuEHAABAAElEQVR4Ae1dB3gU1Rb+0"
            />
          ) : (
            <div
              style={{
                width: 50,
                height: 50,
                background: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 6,
              }}
            >
              <Text type="secondary" style={{ fontSize: 10 }}>
                No Image
              </Text>
            </div>
          )}
          <div>
            <Text strong>{record.product_name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatCurrency(record.price, currency)} each
            </Text>
          </div>
        </Space>
      ),
    },
      {
        title: "Quantity",
        key: "quantity",
        width: 150,
        align: "center" as const,
        render: (_: any, record: CartItem) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Button
              icon={<MinusCircleOutlined />}
              size="small"
              onClick={() =>
                updateCartItemQuantity(record.product_id, record.quantity - 1)
              }
            />
            <span style={{ minWidth: 30, textAlign: 'center', display: 'inline-block' }}>
              {record.quantity}
            </span>
            <Button
              icon={<PlusCircleOutlined />}
              size="small"
              onClick={() =>
                updateCartItemQuantity(record.product_id, record.quantity + 1)
              }
            />
          </div>
        ),
      },
    {
      title: "Total",
      key: "total",
      width: 100,
      render: (_: any, record: CartItem) => (
        <Text strong style={{ color: "#1890ff" }}>
          {formatCurrency(record.total, currency)}
        </Text>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 80,
      render: (_: any, record: CartItem) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeFromCart(record.product_id)}
        />
      ),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* Products Section */}
        <Col xs={24} lg={14}>
          <Card
            title="Products"
            extra={
              <Input
                placeholder="Search products or scan barcode..."
                prefix={<SearchOutlined />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 300 }}
                allowClear
                size="large"
              />
            }
            style={{ borderRadius: 12 }}
          >
            {filteredProducts.length === 0 ? (
              <Empty description="No products found" />
            ) : (
              <Row
                gutter={[12, 12]}
                style={{ maxHeight: "70vh", overflowY: "auto" }}
              >
                {filteredProducts.map((product) => (
                  <Col xs={12} sm={8} md={6} key={product.id}>
                    <Card
                      hoverable
                      style={{
                        borderRadius: 6,
                        cursor: "pointer",
                        border:
                          product.stock <= 0 ? "1px solid #ff4d4f" : undefined,
                      }}
                      bodyStyle={{ padding: 12 }}
                      onClick={() => handleAddToCart(product)}
                      cover={
                        <div
                          style={{
                            height: 120,
                            background: "#f0f0f0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                          }}
                        >
                          {productImages[product.id] ? (
                            <img
                              src={productImages[product.id]}
                              alt={product.name}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <Text type="secondary">No Image</Text>
                          )}
                          {product.stock <= 0 && (
                            <Tag
                              color="red"
                              style={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                              }}
                            >
                              Out of Stock
                            </Tag>
                          )}
                        </div>
                      }
                    >
                      <div>
                        <Text strong style={{ fontSize: 12 }} ellipsis>
                          {product.name}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 10 }}>
                          {product.category || "Uncategorized"}
                        </Text>
                        <br />
                        <Text strong style={{ color: "#1890ff", fontSize: 14 }}>
                          {formatCurrency(product.price, currency)}
                        </Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 10 }}>
                          Stock: {product.stock}
                        </Text>
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </Col>

        {/* Cart Section */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <Space>
                <ShoppingCartOutlined />
                <span>Cart ({cart.length})</span>
              </Space>
            }
            style={{ borderRadius: 12, position: "sticky", top: 24 }}
          >
            <Space direction="vertical" style={{ width: "100%" }} size="middle">
              {/* <Select
                placeholder="Select Customer (Optional)"
                style={{ width: "100%" }}
                value={selectedCustomer}
                onChange={setSelectedCustomer}
                allowClear
                showSearch
                size="large"
                filterOption={(input, option) =>
                  String(option?.label || "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              >
                <Option value={null}>Walk-in Customer</Option>
                {customers.map((customer) => (
                  <Option key={customer.id} value={customer.id}>
                    {customer.name}
                  </Option>
                ))}
              </Select>

              <Divider style={{ margin: "12px 0" }} /> */}

              {cart.length === 0 ? (
                <Empty description="Cart is empty" />
              ) : (
                <Table
                  dataSource={cart}
                  columns={cartColumns}
                  pagination={false}
                  size="small"
                  scroll={{ y: 300 }}
                  rowKey="product_id"
                />
              )}

              {/* <Divider style={{ margin: "12px 0" }} /> */}

              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="small"
              >
                <Row justify="space-between">
                  <Text>Subtotal:</Text>
                  <Text>{formatCurrency(subtotal, currency)}</Text>
                </Row>
                <Row justify="space-between">
                  <Text>Tax (10%):</Text>
                  <Text>{formatCurrency(tax, currency)}</Text>
                </Row>
                <Row justify="space-between">
                  <Text>Discount:</Text>
                  <InputNumber
                    min={0}
                    max={subtotal}
                    value={discount}
                    onChange={(value) => setDiscount(value || 0)}
                    prefix={getCurrencySymbol(currency)}
                    style={{ width: 120 }}
                    size="large"
                  />
                </Row>
                <Divider style={{ margin: "8px 0" }} />
                <Row justify="space-between">
                  <Text strong style={{ fontSize: 18 }}>
                    Total:
                  </Text>
                  <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
                    {formatCurrency(total, currency)}
                  </Text>
                </Row>
              </Space>

              <Select
                placeholder="Payment Method"
                style={{ width: "100%" }}
                value={paymentMethod}
                onChange={setPaymentMethod}
                size="large"
              >
                <Option value="cash">Cash</Option>
                <Option value="card">Card</Option>
                <Option value="upi">UPI</Option>
                <Option value="other">Other</Option>
              </Select>

              <Button
                type="primary"
                icon={<CheckCircleOutlined />}
                block
                size="large"
                onClick={handleCheckout}
                disabled={cart.length === 0 || isProcessing}
                loading={isProcessing}
                style={{ height: 48, fontSize: 16 }}
              >
                Checkout
              </Button>

              {cart.length > 0 && (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  block
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
