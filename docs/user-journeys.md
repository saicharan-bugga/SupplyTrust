# User journeys and workflow diagrams

The diagrams below render directly on GitHub.

## Journey 1 - Create and manage a purchase order

```mermaid
flowchart LR
    A[Officer picks demo role] --> B[Opens PO dashboard]
    B --> C[Clicks New order]
    C --> D[Chooses vendor, adds items, quantities, prices, delivery date]
    D --> E{Form valid?}
    E -- No --> F[Inline errors shown beside fields] --> D
    E -- Yes --> G[Order reference generated, status Draft]
    G --> H[Officer tracks order in the PO list]
```

## Journey 2 - Vendor updates an order

```mermaid
flowchart LR
    A[Vendor opens assigned orders] --> B[Selects an order]
    B --> C[Reviews items and deadline]
    C --> D[Updates fulfilment status + estimated delivery]
    D --> E[Update saved and added to status history]
    E --> F[Procurement team sees the latest status]
```

## Journey 3 - Receipt, inspection and approval

```mermaid
sequenceDiagram
    participant W as Warehouse Receiver
    participant Q as Quality Inspector
    participant S as System
    participant P as Procurement Officer
    W->>S: Record delivered quantity
    S-->>W: Receipt saved, order Partially Received / Received
    Q->>S: Open order, enter inspected / accepted / rejected, defects, notes
    S->>S: Check accepted + rejected = inspected
    S-->>Q: Inspection saved (Pending Inspection)
    P->>S: Review result
    alt Approve
        S-->>P: Decision recorded with timestamp and comments
    else Reject
        S-->>P: Confirm dialog, then decision recorded
    else Request reinspection
        S-->>Q: Reinspection Required (earlier record preserved)
    end
```

## Purchase order status flow

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> PendingApproval: submit
    Draft --> Cancelled: cancel
    PendingApproval --> Approved: approve
    PendingApproval --> Draft: send back
    PendingApproval --> Cancelled: cancel
    Approved --> Ordered: place with vendor
    Approved --> Cancelled: cancel
    Ordered --> PartiallyReceived: partial delivery
    Ordered --> Received: full delivery
    Ordered --> Cancelled: cancel
    PartiallyReceived --> Received: remaining delivered
    Received --> [*]
    Cancelled --> [*]
```

`PendingApproval` is shown as "Pending Approval" and `PartiallyReceived` as "Partially Received" in the interface. Every transition records the actor, timestamp and previous/new status. Cancelled orders accept no further fulfilment updates.

## Inspection outcome flow

```mermaid
stateDiagram-v2
    [*] --> PendingInspection
    PendingInspection --> Passed: inspector submits, officer approves
    PendingInspection --> Failed: inspector submits, officer rejects
    PendingInspection --> ReinspectionRequired: officer requests reinspection
    ReinspectionRequired --> PendingInspection: new inspection recorded
    Passed --> [*]
    Failed --> [*]
```

A failed inspection never marks the whole order as accepted, and reinspection keeps all previous inspection records.
