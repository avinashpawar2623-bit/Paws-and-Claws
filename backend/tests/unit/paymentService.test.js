jest.mock("../../src/config/env", () => ({
  stripeSecretKey: "test_secret",
}));

jest.mock("../../src/models/AuditLog", () => ({
  create: jest.fn(),
}));

jest.mock("../../src/models/Order", () => ({
  findById: jest.fn(),
}));

jest.mock("../../src/models/Payment", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../../src/models/Invoice", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../../src/models/User", () => ({}));
jest.mock("../../src/models/WalletTransaction", () => ({}));

const AuditLog = require("../../src/models/AuditLog");
const Order = require("../../src/models/Order");
const Payment = require("../../src/models/Payment");
const Invoice = require("../../src/models/Invoice");

const { processOrderPayment } = require("../../src/services/paymentService");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("processOrderPayment - idempotency + invoice generation", () => {
  test("does not create duplicate Payment when idempotencyKey exists, but ensures invoice", async () => {
    const existingPayment = {
      _id: "pay_1",
      status: "succeeded",
      provider: "stripe",
      receiptUrl: "https://receipt.example/pay_1",
      currency: "usd",
      amount: 100,
    };

    Payment.findOne.mockResolvedValue(existingPayment);
    Invoice.findOne.mockResolvedValue(null);

    const orderSave = jest.fn();
    Order.findById.mockResolvedValue({
      _id: "order_1",
      shippingAddress: "Some address",
      items: [{ name: "Toy", quantity: 2, price: 10 }],
      save: orderSave,
    });

    Invoice.create.mockResolvedValue({
      _id: "inv_1",
      invoiceNumber: "INV_TEST",
    });

    const result = await processOrderPayment({
      userId: "user_1",
      orderId: "order_1",
      provider: "stripe",
      idempotencyKey: "idem_1",
      currency: "usd",
    });

    expect(result).toBe(existingPayment);
    expect(Payment.create).not.toHaveBeenCalled();
    expect(Invoice.create).toHaveBeenCalledTimes(1);
    expect(AuditLog.create).not.toHaveBeenCalled();
  });

  test("creates Payment + invoice for new successful payments", async () => {
    Payment.findOne.mockResolvedValue(null);

    const orderSave = jest.fn().mockResolvedValue(true);
    Order.findById.mockResolvedValue({
      _id: "order_2",
      userId: "user_2",
      shippingAddress: "Another address",
      items: [{ name: "Food", quantity: 1, price: 50 }],
      totalPrice: 50,
      save: orderSave,
    });

    Payment.create.mockImplementation(async (payload) => ({
      _id: "pay_2",
      status: "succeeded",
      provider: payload.provider,
      providerPaymentId: payload.providerPaymentId,
      receiptUrl: payload.receiptUrl,
      currency: payload.currency,
      amount: payload.amount,
    }));

    Invoice.findOne.mockResolvedValue(null);
    Invoice.create.mockResolvedValue({
      _id: "inv_2",
      invoiceNumber: "INV_TEST2",
    });
    AuditLog.create.mockResolvedValue(true);

    const result = await processOrderPayment({
      userId: "user_2",
      orderId: "order_2",
      provider: "stripe",
      idempotencyKey: "idem_2",
      currency: "usd",
    });

    expect(result).toBeDefined();
    expect(Payment.create).toHaveBeenCalledTimes(1);
    expect(Invoice.create).toHaveBeenCalledTimes(1);
    expect(AuditLog.create).toHaveBeenCalledTimes(1);
    expect(orderSave).toHaveBeenCalledTimes(1);
  });
});

