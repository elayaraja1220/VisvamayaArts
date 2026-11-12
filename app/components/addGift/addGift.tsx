"use client";

import { useState } from "react";
import { FormCheckbox, FormInput, FormTextarea } from "../forms";

export default function GiftOptions() {
  const [addGift, setAddGift] = useState(false);
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");

  return (
    <div className="gift-options">
      <FormCheckbox
        id="addGift"
        name="gift"
        label="Add to Gift"
        checked={addGift}
        onChange={(e) => setAddGift(e.target.checked)}
      />

      {/* Only show the gift fields when the box is ticked */}
      {addGift && (
        <div>
          <FormTextarea
            label="Personalized Message"
            placeholder="Write your personalized message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <FormInput
            variant="outline"
            label="Sender Name"
            placeholder="Enter sender name"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}