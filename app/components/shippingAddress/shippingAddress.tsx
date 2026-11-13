"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from "@/app/components/card/card";
import Button from "@/app/components/button/button";
import BackTitle from "../backTitle/backTitle";
import Typography from "../typegrophy/typography";
import Modal from "../overlays/modal/modal";
import AddressForm, {
  type AddressFormData,
  type AddressFormValues,
} from "../addressForm/addressForm";
import ConfirmationDialog from "@/app/components/overlays/confirmation-dialog/confirmation-dialog";
import { Edit2, Trash2, Check } from "react-feather";
import "./shippingAddress.css";
import Link from "next/link";
import { Container } from "../container/Container";

export type ShippingAddressData = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  addressLine: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  block: string
};

export type CartOrderItem = {
  product_id: string | number;
  product_name: string;
  product_price: string | number;
  quantity: number;
};

type ShippingAddressProps = {
  addresses: ShippingAddressData[];

  cartItems?: CartOrderItem[];

  selectedAddressId?: string;

  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;

  userDetails?: {
    fullName?: string;
    phone?: string;
    email?: string;
  };

  onSaveAddress: (
    address: ShippingAddressData,
    mode: "add" | "edit",
  ) => void | Promise<void>;

  onDeleteAddress?: (address: ShippingAddressData) => void;
  onSelectAddress?: (address: ShippingAddressData) => void;

  onProceedToPay?: (address: ShippingAddressData) => void | Promise<void>;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

function toFormValues(address: ShippingAddressData): AddressFormData {
  const names = address.fullName.trim().split(/\s+/).filter(Boolean);

  return {
    id: address.id,
    receiverFirstName: names[0] ?? "",
    receiverLastName: names.slice(1).join(" "),
    phone: address.phone,
    email: address.email,
    addressLine1: address.addressLine,
    addressLine2: address.addressLine2 ?? "",
    pincode: address.pincode,
    country: address.country,
    state: address.state,
    city: address.city,
    block: address.block
  };
}

export default function ShippingAddress({
  addresses,
  cartItems = [],
  selectedAddressId,
  subtotal,
  cgst,
  sgst,
  grandTotal,
  userDetails,
  onSaveAddress,
  onDeleteAddress,
  onSelectAddress,
  onProceedToPay,
}: ShippingAddressProps) {
  const [internalSelectedId, setInternalSelectedId] = useState(
    selectedAddressId ?? addresses[0]?.id ?? "",
  );

  const [open, setOpen] = useState(false);
  const [editingAddress, setEditingAddress] =
    useState<ShippingAddressData | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [orderError, setOrderError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [dialogStatus, setDialogStatus] = useState<
    "success" | "failed" | "inprogress"
  >("inprogress");

  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");

  const showDialog = (
    status: "success" | "failed" | "inprogress",
    title: string,
    description: string,
  ) => {
    setDialogStatus(status);
    setDialogTitle(title);
    setDialogDescription(description);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (dialogStatus === "inprogress") return;
    setDialogOpen(false);
  };

  useEffect(() => {
    if (selectedAddressId !== undefined) {
      setInternalSelectedId(selectedAddressId);
    } else if (!addresses.some((item) => item.id === internalSelectedId)) {
      setInternalSelectedId(addresses[0]?.id ?? "");
    }
  }, [addresses, selectedAddressId, internalSelectedId]);

  const activeId = selectedAddressId ?? internalSelectedId;

  const selectedAddress = addresses.find((item) => item.id === activeId);

  const openAdd = () => {
    setEditingAddress(null);
    setFormError("");
    setOpen(true);
  };

  const openEdit = (address: ShippingAddressData) => {
    setEditingAddress(address);
    setFormError("");
    setOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;

    setOpen(false);
    setEditingAddress(null);
    setFormError("");
  };

  const handleSave = async (values: AddressFormValues) => {
    const isEditing = Boolean(editingAddress);

    const address: ShippingAddressData = {
      id: editingAddress?.id ?? crypto.randomUUID(),

      fullName: [
        values.receiverFirstName.trim(),
        values.receiverLastName.trim(),
      ]
        .filter(Boolean)
        .join(" "),

      phone: values.phone.trim(),
      email: values.email.trim(),
      addressLine: values.addressLine1.trim(),
      addressLine2: values.addressLine2.trim(),
      pincode: values.pincode.trim(),
      country: values.country,
      state: values.state,
      city: values.city,
      block: values.block
    };

    setSubmitting(true);
    setFormError("");

    showDialog(
      "inprogress",
      isEditing ? "Updating Address" : "Saving Address",
      "Please wait while we save your shipping address.",
    );

    try {
      await onSaveAddress(address, isEditing ? "edit" : "add");

      setInternalSelectedId(address.id);
      onSelectAddress?.(address);

      setOpen(false);
      setEditingAddress(null);

      showDialog(
        "success",
        isEditing
          ? "Address Updated Successfully!"
          : "Address Saved Successfully!",
        isEditing
          ? "Your shipping address has been updated successfully."
          : "Your new shipping address has been saved successfully.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to save your shipping address. Please try again.";

      setFormError(message);

      showDialog(
        "failed",
        "Address Save Failed",
        message,
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleProceedToPay = async () => {
    setOrderError("");

    if (!selectedAddress) {
      setOrderError("Please select a shipping address.");
      return;
    }

    if (!cartItems.length) {
      setOrderError(
        "Your cart is empty. Please return to your cart and add products.",
      );
      return;
    }

    setSubmitting(true);

    try {
      await onProceedToPay?.(selectedAddress);
    } catch (error) {
      console.error("Proceed to pay error:", error);

      setOrderError(
        error instanceof Error
          ? error.message
          : "Something went wrong while submitting your order.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="shipping-checkout" aria-label="Shipping and payment">
      <Container>
        <div className="shipping-section-header">
          <BackTitle title="Order Placed & Shipment" />

          <Button
            type="button"
            variant="filled"
            color="white"
            textColor="secondary"
            curve="full"
            onClick={openAdd}
          >
            + Add New Address
          </Button>
        </div>

        <Card className="card-shipping" padding="large">
          <CardBody className="shipping-checkout-layout">

            <div className="shipping-address-section">
              <div className="shipping-address-list">
                {addresses.length === 0 ? (
                  <Card className="shipping-address-empty">
                    <CardBody>
                      <p>No shipping addresses found.</p>

                      <Button type="button" onClick={openAdd}>
                        Add Address
                      </Button>
                    </CardBody>
                  </Card>
                ) : (
                  addresses.map((address) => {
                    const isSelected = address.id === activeId;

                    return (
                      <Card
                        key={address.id}
                        padding="medium"
                        className={`shipping-address-card ${
                          isSelected ? "is-selected" : ""
                        }`}
                      >
                        <CardHeader className="shipping-address-card-header">
                          <button
                            type="button"
                            className="shipping-address-select"
                            aria-pressed={isSelected}
                            onClick={() => {
                              setInternalSelectedId(address.id);
                              onSelectAddress?.(address);
                            }}
                          >
                            <span
                              className={`shipping-address-check ${
                                isSelected ? "selected" : ""
                              }`}
                            >
                              {isSelected ? (
                                <Check size={18} aria-hidden="true" />
                              ) : (
                                <span className="shipping-address-radio" />
                              )}
                            </span>

                            <span>Shipping Address</span>
                          </button>

                          <div className="shipping-address-actions">
                            <Button
                              type="button"
                              variant="iconOnly"
                              color="primary"
                              onClick={() => openEdit(address)}
                              aria-label={`Edit ${address.fullName}`}
                            >
                              <Edit2 className="shipping-icon" />
                            </Button>

                            <Button
                              type="button"
                              variant="iconOnly"
                              color="primary"
                              onClick={() => onDeleteAddress?.(address)}
                              aria-label={`Delete ${address.fullName}`}
                            >
                              <Trash2 className="shipping-icon" />
                            </Button>
                          </div>
                        </CardHeader>

                        <CardBody className="shipping-address-card-body">
                          <Typography variant="h5" className="m-0">
                            {address.fullName}
                          </Typography>

                          <Typography className="shipping-address-contact">
                            <span>{address.phone}</span>

                            <span
                              className="shipping-contact-divider"
                              aria-hidden="true"
                            >
                              |
                            </span>

                            <Link
                              href={`mailto:${address.email}`}
                              className="shipping-contact-emailto"
                            >
                              {address.email}
                            </Link>
                          </Typography>

                          <address>
                            <Typography className="m-0">
                              {address.addressLine}, {" "}

                              {address.addressLine2 && (
                                <>
                                 
                                  {address.addressLine2},  {" "}
                                </>
                              )}

                              <br />
                               {address.block} {" "}{address.city}, {address.state}, Pincode - {address.pincode}, {address.country}. 
                            </Typography>
                          </address>
                        </CardBody>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>

            <Card padding="large" className="shipping-order-summary">
              <CardBody>
                <div className="shipping-summary-row">
                  <Typography className="m-0" variant="h6">
                    Subtotal
                  </Typography>

                  <Typography className="m-0" variant="h5">
                    {formatCurrency(subtotal)}
                  </Typography>
                </div>

                <div className="shipping-summary-row">
                  <Typography className="m-0" variant="caption">
                    CGST
                  </Typography>

                  <Typography className="m-0" variant="h6">
                    {formatCurrency(cgst)}
                  </Typography>
                </div>

                <div className="shipping-summary-row">
                  <Typography className="m-0" variant="caption">
                    SGST
                  </Typography>

                  <Typography className="m-0" variant="h6">
                    {formatCurrency(sgst)}
                  </Typography>
                </div>

                <div className="shipping-summary-total">
                  <Typography variant="h4">TOTAL</Typography>

                  <Typography variant="h3">
                    {formatCurrency(grandTotal)}
                  </Typography>
                </div>

                {orderError && (
                  <p className="address-form-error" role="alert">
                    {orderError}
                  </p>
                )}
              </CardBody>

              <CardFooter className="shipping-summary-footer">
                <Button
                  type="button"
                  variant="filled"
                  color="primary"
                  size="fullwidth"
                  curve="full"
                  disabled={
                    !selectedAddress ||
                    cartItems.length === 0 ||
                    submitting
                  }
                  onClick={handleProceedToPay}
                >
                  {submitting ? "Submitting Order..." : "Proceed to Order"}
                </Button>
              </CardFooter>
            </Card>

          </CardBody>
        </Card>
      </Container>

      <Modal
        open={open}
        onClose={closeModal}
        title={editingAddress ? "Edit Address" : "Add New Address"}
        size="large"
        modalClassName="shipping-modal"
        bodyClassName="shipping-adress-modal-body"
      >
        {formError && (
          <p className="address-form-error" role="alert">
            {formError}
          </p>
        )}

        <Card>
          <AddressForm
            key={editingAddress?.id ?? "new-address"}
            initialValues={
              editingAddress ? toFormValues(editingAddress) : undefined
            }
            userDetails={userDetails}
            submitting={submitting}
            onSubmit={handleSave}
            onCancel={closeModal}
          />
        </Card>
      </Modal>

      <ConfirmationDialog
        open={dialogOpen}
        status={dialogStatus}
        title={dialogTitle}
        description={dialogDescription}
        autoCloseDuration={5000}
        autoClose={dialogStatus === "success"}
        onPrimaryAction={handleCloseDialog}
        onSecondaryAction={handleCloseDialog}
        onClose={handleCloseDialog}
        showCloseButton={dialogStatus !== "inprogress"}
        closeOnBackdrop={false}
      />
    </section>
  );
}
