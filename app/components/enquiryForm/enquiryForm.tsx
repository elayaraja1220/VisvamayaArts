"use client";

import { useEffect, useState } from "react";

import {
  useForm,
  type SubmitHandler,
} from "react-hook-form";

import { FormInput, FormTextarea } from "../forms";
import Typography from "../typegrophy/typography";
import Button from "../button/button";

import ConfirmationDialog, {
  type ConfirmationStatus,
} from "../overlays/confirmation-dialog/confirmation-dialog";

import {
  sendBulkOrderEnquiry,
  type BulkOrderEnquiryPayload,
} from "@/app/service/dataService";

import "./enquiryForm.css";

export type EnquiryFormValues = BulkOrderEnquiryPayload;

type EnquiryFormProps = {
  initialValues?: Partial<EnquiryFormValues>;
  submitting?: boolean;
  onSuccess?: () => void;
};

const EMPTY_VALUES: EnquiryFormValues = {
  name: "",
  phone_number: "",
  mail_id: "",
  description: "",
};

export default function EnquiryForm({
  initialValues,
  submitting = false,
  onSuccess,
}: EnquiryFormProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const [dialogStatus, setDialogStatus] =
    useState<ConfirmationStatus>("inprogress");

  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryFormValues>({
    defaultValues: {
      ...EMPTY_VALUES,
      ...initialValues,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    reset({
      ...EMPTY_VALUES,
      ...initialValues,
    });
  }, [initialValues, reset]);

  const showDialog = (
    status: ConfirmationStatus,
    title: string,
    description: string
  ) => {
    setDialogStatus(status);
    setDialogTitle(title);
    setDialogDescription(description);
    setDialogOpen(true);
  };

  const submitHandler: SubmitHandler<EnquiryFormValues> = async (
    values
  ) => {
    showDialog(
      "inprogress",
      "Submitting Your Enquiry",
      "Please wait while we submit your bulk order enquiry. Do not close this page."
    );

    try {
      const payload: EnquiryFormValues = {
        name: values.name.trim(),
        phone_number: values.phone_number.trim(),
        mail_id: values.mail_id.trim(),
        description: values.description.trim(),
      };

      const success = await sendBulkOrderEnquiry(payload);

      if (success) {
        reset(EMPTY_VALUES);

        showDialog(
          "success",
          "Enquiry Submitted Successfully!",
          `Thank you, ${payload.name}! Your bulk order enquiry has been successfully submitted. Our team will contact you shortly at ${payload.phone_number} or ${payload.mail_id}.`
        );

        onSuccess?.();
      } else {
        showDialog(
          "failed",
          "Enquiry Submission Failed",
          "We couldn't submit your enquiry. Please try again."
        );
      }
    } catch (error) {
      console.error(
        "[EnquiryForm] Submission failed:",
        error
      );

      showDialog(
        "failed",
        "Something Went Wrong",
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while submitting your enquiry. Please try again."
      );
    }
  };

  const busy = submitting || isSubmitting;

  const handleCloseDialog = () => {
    if (dialogStatus === "inprogress") return;

    setDialogOpen(false);
  };

  return (
    <>
      <form
        className="enquiry-form"
        onSubmit={handleSubmit(submitHandler)}
        noValidate
      >
        <Typography
          variant="h5"
          className="enquiry-form-heading"
        >
          Bulk Order Enquiry
        </Typography>

        <div className="enquiry-form-body">

          <FormInput
            label="Name"
            placeholder="Enter your name"
            autoComplete="name"
            required
            error={errors.name?.message}
            {...register("name", {
              required: "Name is required",
              minLength: {
                value: 2,
                message: "Enter at least 2 characters",
              },
              maxLength: {
                value: 100,
                message: "Maximum 100 characters allowed",
              },
            })}
          />

          <FormInput
            label="Phone Number"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="Enter 10-digit mobile number"
            required
            error={errors.phone_number?.message}
            {...register("phone_number", {
              required: "Phone number is required",
              pattern: {
                value: /^[6-9]\d{9}$/,
                message: "Enter a valid 10-digit Indian mobile number",
              },
            })}
          />

          <FormInput
            label="Mail ID"
            type="email"
            autoComplete="email"
            placeholder="Enter your email address"
            required
            error={errors.mail_id?.message}
            {...register("mail_id", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            })}
          />

          <FormTextarea
            label="Description"
            placeholder="Tell us about your bulk order enquiry..."
            rows={5}
            required
            variant="filled"
            size="medium"
            curve="medium"
            error={errors.description?.message}
            {...register("description", {
              required: "Description is required",
              minLength: {
                value: 10,
                message: "Enter at least 10 characters",
              },
              maxLength: {
                value: 1000,
                message: "Maximum 1000 characters allowed",
              },
            })}
          />

          <div className="enquiry-form-actions">
            <Button
              type="submit"
              color="secondary"
              curve="full"
              size="fullwidth"
              className="enquiry-form-button"
              disabled={busy}
            >
              {busy ? "Submitting..." : "Submit Enquiry"}
            </Button>
          </div>

        </div>
      </form>

      <ConfirmationDialog
        open={dialogOpen}
        status={dialogStatus}
        title={dialogTitle}
        description={dialogDescription}
        autoCloseDuration={5000}
        autoClose={true}
        onPrimaryAction={handleCloseDialog}
        onSecondaryAction={handleCloseDialog}
        onClose={handleCloseDialog}
        showCloseButton={dialogStatus !== "inprogress"}
        closeOnBackdrop={false}
      />
    </>
  );
}
