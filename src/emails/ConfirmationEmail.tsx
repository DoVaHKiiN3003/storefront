import type { OrderData } from "../app/lib/types";

// Re-export the type so the API route can import it
export type { OrderData };

export default function ConfirmationEmail({
  order,
  orderNumber,
}: {
  order: OrderData;
  orderNumber: string;
}) {
  const placedDate = new Date(order.timestamp).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const address = order.shippingAddress;

  return (
    <html>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f5f0eb" }}>
        <table
          width="100%"
          cellPadding="0"
          cellSpacing="0"
          style={{ backgroundColor: "#f5f0eb", padding: "40px 20px" }}
        >
          <tr>
            <td align="center">
              <table
                width="560"
                cellPadding="0"
                cellSpacing="0"
                style={{
                  maxWidth: "560px",
                  backgroundColor: "#ffffff",
                  borderRadius: "16px",
                  overflow: "hidden",
                }}
              >
                {/* Header */}
                <tr>
                  <td
                    style={{
                      padding: "40px 40px 0",
                      textAlign: "center",
                    }}
                  >
                    <table
                      width="48"
                      cellPadding="0"
                      cellSpacing="0"
                      style={{ margin: "0 auto 20px" }}
                    >
                      <tr>
                        <td
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            backgroundColor: "#7a8a7a",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          <span style={{ color: "#f5f0eb", fontSize: "24px", lineHeight: "48px" }}>
                            ✓
                          </span>
                        </td>
                      </tr>
                    </table>
                    <h1
                      style={{
                        margin: "0 0 4px",
                        fontSize: "24px",
                        fontWeight: 600,
                        letterSpacing: "-0.02em",
                        color: "#3c2f2a",
                      }}
                    >
                      Order Confirmed
                    </h1>
                    <p style={{ margin: "0 0 4px", fontSize: "14px", color: "#7a6e64" }}>
                      Thank you for your order!
                    </p>
                    <p
                      style={{
                        margin: "0 0 8px",
                        fontSize: "12px",
                        fontFamily: "monospace",
                        color: "#7a6e64",
                      }}
                    >
                      Order #{orderNumber}
                    </p>
                    <p style={{ margin: "0 0 24px", fontSize: "12px", color: "#9a8e84" }}>
                      Placed on {placedDate}
                    </p>
                  </td>
                </tr>

                {/* Divider */}
                <tr>
                  <td style={{ padding: "0 40px" }}>
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td
                          style={{
                            borderTop: "1px solid #e8e0d6",
                            lineHeight: "1px",
                            fontSize: "1px",
                          }}
                        >
                          &nbsp;
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Items */}
                <tr>
                  <td style={{ padding: "24px 40px 16px" }}>
                    <h2
                      style={{
                        margin: "0 0 16px",
                        fontSize: "12px",
                        fontWeight: 600,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        color: "#3c2f2a",
                      }}
                    >
                      Items ({order.items.length})
                    </h2>

                    {order.items.map((item) => (
                      <table
                        key={item.id}
                        width="100%"
                        cellPadding="0"
                        cellSpacing="0"
                        style={{ marginBottom: "12px" }}
                      >
                        <tr>
                          <td
                            width="64"
                            style={{ verticalAlign: "top", paddingRight: "12px" }}
                          >
                            <table
                              width="64"
                              cellPadding="0"
                              cellSpacing="0"
                              style={{
                                borderRadius: "8px",
                                backgroundColor: "#f5f0eb",
                                overflow: "hidden",
                              }}
                            >
                              <tr>
                                <td
                                  style={{
                                    padding: 0,
                                    textAlign: "center",
                                    verticalAlign: "middle",
                                  }}
                                >
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    width={64}
                                    height={72}
                                    style={{
                                      display: "block",
                                      width: "64px",
                                      height: "72px",
                                      objectFit: "cover",
                                    }}
                                  />
                                </td>
                              </tr>
                            </table>
                          </td>
                          <td style={{ verticalAlign: "top" }}>
                            <p
                              style={{
                                margin: "0 0 2px",
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#3c2f2a",
                              }}
                            >
                              {item.name}
                            </p>
                            <p
                              style={{
                                margin: "0",
                                fontSize: "12px",
                                color: "#7a6e64",
                              }}
                            >
                              ${item.price.toFixed(2)} each &times; {item.quantity}
                            </p>
                          </td>
                          <td
                            width="80"
                            style={{
                              verticalAlign: "top",
                              textAlign: "right",
                            }}
                          >
                            <p
                              style={{
                                margin: "0",
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#3c2f2a",
                              }}
                            >
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </td>
                        </tr>
                      </table>
                    ))}
                  </td>
                </tr>

                {/* Divider */}
                <tr>
                  <td style={{ padding: "0 40px" }}>
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td
                          style={{
                            borderTop: "1px solid #e8e0d6",
                            lineHeight: "1px",
                            fontSize: "1px",
                          }}
                        >
                          &nbsp;
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Order Summary */}
                <tr>
                  <td style={{ padding: "16px 40px 8px" }}>
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <Row label="Subtotal" value={order.subtotal} />
                      <Row label="Shipping" value={order.shipping} free />
                      <Row label="Tax" value={order.tax} />
                    </table>
                  </td>
                </tr>

                {/* Total */}
                <tr>
                  <td style={{ padding: "8px 40px" }}>
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td
                          style={{
                            borderTop: "1px solid #e8e0d6",
                            paddingTop: "12px",
                          }}
                        >
                          <table width="100%" cellPadding="0" cellSpacing="0">
                            <tr>
                              <td>
                                <span
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: 600,
                                    color: "#3c2f2a",
                                  }}
                                >
                                  Total
                                </span>
                              </td>
                              <td align="right">
                                <span
                                  style={{
                                    fontSize: "20px",
                                    fontWeight: 600,
                                    letterSpacing: "-0.01em",
                                    color: "#3c2f2a",
                                  }}
                                >
                                  ${order.total.toFixed(2)}
                                </span>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Divider */}
                <tr>
                  <td style={{ padding: "0 40px" }}>
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td
                          style={{
                            borderTop: "1px solid #e8e0d6",
                            lineHeight: "1px",
                            fontSize: "1px",
                          }}
                        >
                          &nbsp;
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Shipping Address */}
                {address && (
                  <tr>
                    <td style={{ padding: "24px 40px" }}>
                      <h2
                        style={{
                          margin: "0 0 8px",
                          fontSize: "12px",
                          fontWeight: 600,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          color: "#3c2f2a",
                        }}
                      >
                        Shipping To
                      </h2>
                      <p
                        style={{
                          margin: "0",
                          fontSize: "13px",
                          color: "#7a6e64",
                          lineHeight: "1.6",
                        }}
                      >
                        {address.name && <>{address.name}<br /></>}
                        {address.line1 && <>{address.line1}<br /></>}
                        {address.line2 && <>{address.line2}<br /></>}
                        {address.city && address.state && `${address.city}, ${address.state} ${address.zip || ""}`}
                      </p>
                    </td>
                  </tr>
                )}

                {/* Divider */}
                <tr>
                  <td style={{ padding: "0 40px" }}>
                    <table width="100%" cellPadding="0" cellSpacing="0">
                      <tr>
                        <td
                          style={{
                            borderTop: "1px solid #e8e0d6",
                            lineHeight: "1px",
                            fontSize: "1px",
                          }}
                        >
                          &nbsp;
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td
                    style={{
                      padding: "24px 40px 40px",
                      textAlign: "center",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 4px",
                        fontSize: "11px",
                        color: "#9a8e84",
                      }}
                    >
                      Need help? Reply to this email or contact our support team.
                    </p>
                    <p
                      style={{
                        margin: "0",
                        fontSize: "11px",
                        color: "#9a8e84",
                      }}
                    >
                      &copy; {new Date().getFullYear()} Storefront. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}

// ── Inline Row helper ──────────────────────────────────

function Row({
  label,
  value,
  free,
}: {
  label: string;
  value: number;
  free?: boolean;
}) {
  return (
    <table width="100%" cellPadding="0" cellSpacing="0" style={{ marginBottom: "6px" }}>
      <tr>
        <td>
          <span style={{ fontSize: "13px", color: "#7a6e64" }}>{label}</span>
        </td>
        <td align="right">
          {free ? (
            <span
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#7a8a7a",
              }}
            >
              FREE
            </span>
          ) : (
            <span style={{ fontSize: "13px", fontWeight: 500, color: "#3c2f2a" }}>
              ${value.toFixed(2)}
            </span>
          )}
        </td>
      </tr>
    </table>
  );
}
