
"use client";

import { useEffect, useState } from "react";

import {
    Controller,
    useForm,
    type SubmitHandler,
} from "react-hook-form";

import "./addressForm.css";

import { FormInput, FormSelect } from "../forms";
import Button from "../button/button";
import Typography from "../typegrophy/typography";

/* -------------------------------------------------------------------------- */
/*                                    TYPES                                   */
/* -------------------------------------------------------------------------- */

export type AddressFormValues = {
    receiverFirstName: string;
    receiverLastName: string;
    phone: string;
    email: string;
    addressLine1: string;
    addressLine2: string;
    block: string;
    pincode: string;
    country: string;
    state: string;
    city: string;
};

export type AddressFormData = AddressFormValues & {
    id?: string;
};

type AddressFormProps = {
    initialValues?: Partial<AddressFormData>;

    userDetails?: {
        fullName?: string;
        phone?: string;
        email?: string;
    };

    submitting?: boolean;

    onSubmit: (
        values: AddressFormValues
    ) => void | Promise<void>;

    onCancel?: () => void;
};

type SelectOption = {
    label: string;
    value: string;
};

/* -------------------------------------------------------------------------- */
/*                              DEFAULT VALUES                                */
/* -------------------------------------------------------------------------- */

const EMPTY_VALUES: AddressFormValues = {
    receiverFirstName: "",
    receiverLastName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    block: "",
    pincode: "",
    country: "India",
    state: "",
    city: "",
};

/* -------------------------------------------------------------------------- */
/*                              COUNTRY OPTIONS                               */
/* -------------------------------------------------------------------------- */

const countryOptions: SelectOption[] = [
    { label: "India", value: "India" },
];

/* -------------------------------------------------------------------------- */
/*                               STATE OPTIONS                                */
/* -------------------------------------------------------------------------- */

const stateOptions: SelectOption[] = [
    { label: "Tamil Nadu", value: "Tamil Nadu" },
    { label: "Karnataka", value: "Karnataka" },
    { label: "Kerala", value: "Kerala" },
    { label: "Andhra Pradesh", value: "Andhra Pradesh" },
    { label: "Telangana", value: "Telangana" },
    { label: "Maharashtra", value: "Maharashtra" },
];

/* -------------------------------------------------------------------------- */
/*                           CITY OPTIONS BY STATE                            */
/* -------------------------------------------------------------------------- */

const cityOptionsByState: Record<string, SelectOption[]> = {
    "Tamil Nadu": [
        { label: "Chennai", value: "Chennai" },
        { label: "Coimbatore", value: "Coimbatore" },
        { label: "Madurai", value: "Madurai" },
        { label: "Salem", value: "Salem" },
        { label: "Tiruchirappalli", value: "Tiruchirappalli" },
        { label: "Tirunelveli", value: "Tirunelveli" },
    ],

    Karnataka: [
        { label: "Bengaluru", value: "Bengaluru" },
        { label: "Mysuru", value: "Mysuru" },
        { label: "Mangaluru", value: "Mangaluru" },
    ],

    Kerala: [
        { label: "Thiruvananthapuram", value: "Thiruvananthapuram" },
        { label: "Kochi", value: "Kochi" },
        { label: "Kozhikode", value: "Kozhikode" },
    ],

    "Andhra Pradesh": [
        { label: "Vijayawada", value: "Vijayawada" },
        { label: "Visakhapatnam", value: "Visakhapatnam" },
        { label: "Tirupati", value: "Tirupati" },
    ],

    Telangana: [
        { label: "Hyderabad", value: "Hyderabad" },
        { label: "Warangal", value: "Warangal" },
    ],

    Maharashtra: [
        { label: "Mumbai", value: "Mumbai" },
        { label: "Pune", value: "Pune" },
        { label: "Nagpur", value: "Nagpur" },
    ],
};

/* -------------------------------------------------------------------------- */
/*                            PINCODE API TYPES                               */
/* -------------------------------------------------------------------------- */

type PostalResponse = {
    Status: string;
    Message: string;
    PostOffice: {
        Name: string;
        Country: string;
        State: string;
        District: string;
        Block: string | null;
        Pincode: string;
        Region?: string;
        Division?: string;
        Circle?: string;
        BranchType?: string;
        DeliveryStatus?: string;
    }[] | null;
};

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export default function AddressForm({
    initialValues,
    userDetails,
    submitting = false,
    onSubmit,
    onCancel,
}: AddressFormProps) {

    /* ---------------------------------------------------------------------- */
    /*                              FORM STATE                                */
    /* ---------------------------------------------------------------------- */

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<AddressFormValues>({
        defaultValues: {
            ...EMPTY_VALUES,
            ...initialValues,
        },
        mode: "onBlur",
    });

    /* ---------------------------------------------------------------------- */
    /*                            PINCODE STATE                               */
    /* ---------------------------------------------------------------------- */

    const [pincodeLoading, setPincodeLoading] = useState(false);

    const [pincodeMessage, setPincodeMessage] = useState("");

    const [pincodeError, setPincodeError] = useState(false);

    /* ---------------------------------------------------------------------- */
    /*                              WATCH VALUES                              */
    /* ---------------------------------------------------------------------- */

    const firstName = watch("receiverFirstName");
    const lastName = watch("receiverLastName");
    const phone = watch("phone");
    const email = watch("email");

    const pincode = watch("pincode");

    const selectedState = watch("state");
    const selectedCity = watch("city");

    /* ---------------------------------------------------------------------- */
    /*                         USE MY DETAILS CHECKBOX                        */
    /* ---------------------------------------------------------------------- */

    const userNameParts = (userDetails?.fullName ?? "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    const isUsingMyDetails =
        userNameParts.length > 0 &&
        firstName === userNameParts[0] &&
        lastName === userNameParts.slice(1).join(" ") &&
        phone === (userDetails?.phone ?? "") &&
        email === (userDetails?.email ?? "");

    /* ---------------------------------------------------------------------- */
    /*                            RESET FORM                                  */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        reset({
            ...EMPTY_VALUES,
            ...initialValues,
        });

        setPincodeMessage("");
        setPincodeError(false);
    }, [initialValues, reset]);

    /* ---------------------------------------------------------------------- */
    /*                         AUTOMATIC PINCODE LOOKUP                       */
    /* ---------------------------------------------------------------------- */

    useEffect(() => {
        const pin = (pincode ?? "").replace(/\D/g, "");

        // Empty pincode: preserve initial address values.
        if (pin.length === 0) {
            setPincodeLoading(false);
            setPincodeMessage("");
            setPincodeError(false);
            return;
        }

        // Wait until the user enters all 6 digits.
        if (pin.length < 6) {
            setValue("state", "");
            setValue("city", "");
            setValue("block", "");

            setPincodeLoading(false);
            setPincodeMessage("");
            setPincodeError(false);

            return;
        }

        let cancelled = false;

        const controller = new AbortController();

        // Clear previous location when a new PIN is entered.
        setValue("state", "");
        setValue("city", "");
        setValue("block", "");

        setPincodeMessage("");
        setPincodeError(false);

        // Debounce API request.
        const timer = setTimeout(async () => {
            setPincodeLoading(true);

            try {
                const response = await fetch(
                    `https://api.postalpincode.in/pincode/${pin}`,
                    {
                        method: "GET",
                        cache: "no-store",
                        signal: controller.signal,
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        "Unable to fetch pincode details."
                    );
                }

                const result: PostalResponse[] =
                    await response.json();

                // Invalid pincode.
                if (
                    result?.[0]?.Status !== "Success" ||
                    !result?.[0]?.PostOffice?.length
                ) {
                    if (!cancelled) {
                        setValue("state", "");
                        setValue("city", "");
                        setValue("block", "");

                        setPincodeError(true);

                        setPincodeMessage(
                            "Invalid pincode. Please check and try again."
                        );
                    }

                    return;
                }

                // Get first post office details.
                const office = result[0].PostOffice[0];

                if (cancelled) return;

                // Automatically populate country.
                setValue("country", office.Country || "India", {
                    shouldValidate: true,
                    shouldDirty: true,
                });

                // Automatically populate state.
                setValue("state", office.State || "", {
                    shouldValidate: true,
                    shouldDirty: true,
                });

                // Automatically populate city / district.
                setValue("city", office.District || "", {
                    shouldValidate: true,
                    shouldDirty: true,
                });

                // Automatically populate block.
                setValue("block", office.Block || "", {
                    shouldValidate: true,
                    shouldDirty: true,
                });

                setPincodeError(false);

                setPincodeMessage(
                    "Address details fetched successfully."
                );

            } catch (error) {
                if (cancelled) return;

                if (
                    error instanceof Error &&
                    error.name === "AbortError"
                ) {
                    return;
                }

                console.error(
                    "Pincode lookup error:",
                    error
                );

                setPincodeError(true);

                setPincodeMessage(
                    "Unable to fetch address details. Please enter manually."
                );

            } finally {
                if (!cancelled) {
                    setPincodeLoading(false);
                }
            }
        }, 400);

        // Cancel old request when pincode changes.
        return () => {
            cancelled = true;
            clearTimeout(timer);
            controller.abort();
        };

    }, [pincode, setValue]);

    /* ---------------------------------------------------------------------- */
    /*                         USE MY DETAILS HANDLER                         */
    /* ---------------------------------------------------------------------- */

    const handleUseMyDetails = (checked: boolean) => {
        const names = (userDetails?.fullName ?? "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        setValue(
            "receiverFirstName",
            checked ? names[0] ?? "" : "",
            {
                shouldValidate: true,
                shouldDirty: true,
            }
        );

        setValue(
            "receiverLastName",
            checked ? names.slice(1).join(" ") : "",
            {
                shouldValidate: true,
                shouldDirty: true,
            }
        );

        setValue(
            "phone",
            checked ? userDetails?.phone ?? "" : "",
            {
                shouldValidate: true,
                shouldDirty: true,
            }
        );

        setValue(
            "email",
            checked ? userDetails?.email ?? "" : "",
            {
                shouldValidate: true,
                shouldDirty: true,
            }
        );
    };

    /* ---------------------------------------------------------------------- */
    /*                             SUBMIT HANDLER                             */
    /* ---------------------------------------------------------------------- */

    const submitHandler: SubmitHandler<AddressFormValues> = async (
        values
    ) => {
        await onSubmit({
            ...values,

            receiverFirstName: values.receiverFirstName.trim(),

            receiverLastName: values.receiverLastName.trim(),

            phone: values.phone.trim(),

            email: values.email.trim(),

            addressLine1: values.addressLine1.trim(),

            addressLine2: values.addressLine2.trim(),

            block: values.block.trim(),

            pincode: values.pincode.trim(),

            country: values.country.trim(),

            state: values.state.trim(),

            city: values.city.trim(),
        });
    };

    /* ---------------------------------------------------------------------- */
    /*                         DYNAMIC STATE OPTIONS                          */
    /* ---------------------------------------------------------------------- */

    const availableStateOptions = [...stateOptions];

    // Include API-returned states not present in original list.
    if (
        selectedState &&
        !availableStateOptions.some(
            (option) => option.value === selectedState
        )
    ) {
        availableStateOptions.push({
            label: selectedState,
            value: selectedState,
        });
    }

    /* ---------------------------------------------------------------------- */
    /*                          DYNAMIC CITY OPTIONS                          */
    /* ---------------------------------------------------------------------- */

    const cityOptions = [
        ...(cityOptionsByState[selectedState] ?? []),
    ];

    // Include API-returned district in dropdown.
    if (
        selectedCity &&
        !cityOptions.some(
            (option) => option.value === selectedCity
        )
    ) {
        cityOptions.push({
            label: selectedCity,
            value: selectedCity,
        });
    }

    /* ---------------------------------------------------------------------- */
    /*                              FORM STATUS                               */
    /* ---------------------------------------------------------------------- */

    const busy = submitting || isSubmitting;

    /* ---------------------------------------------------------------------- */
    /*                                    UI                                  */
    /* ---------------------------------------------------------------------- */

    return (
        <form
            className="address-form"
            onSubmit={handleSubmit(submitHandler)}
            noValidate
        >
            <div className="scroll-address-body">

                {/* USE MY DETAILS */}

                <label className="address-form__checkbox">
                    <input
                        type="checkbox"
                        checked={isUsingMyDetails}
                        disabled={!userDetails}
                        onChange={(event) =>
                            handleUseMyDetails(event.target.checked)
                        }
                    />

                    <span>
                        Use My Name &amp; Phone Number
                    </span>
                </label>

                {/* USER DETAILS */}

                <div className="address-form">

                    <fieldset className="fieldset form-user-details-fieldset">

                        <FormInput
                            label="Receiver First Name"
                            placeholder="Enter first name"
                            autoComplete="given-name"
                            required
                            error={errors.receiverFirstName?.message}
                            {...register("receiverFirstName", {
                                required: "First name is required",
                                minLength: {
                                    value: 2,
                                    message: "Enter at least 2 characters",
                                },
                                maxLength: {
                                    value: 50,
                                    message: "Maximum 50 characters allowed",
                                },
                            })}
                        />

                        <FormInput
                            label="Receiver Last Name"
                            placeholder="Enter last name"
                            autoComplete="family-name"
                            required
                            error={errors.receiverLastName?.message}
                            {...register("receiverLastName", {
                                required: "Last name is required",
                                maxLength: {
                                    value: 50,
                                    message: "Maximum 50 characters allowed",
                                },
                            })}
                        />

                        <FormInput
                            label="Phone Number"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel"
                            placeholder="10-digit mobile number"
                            required
                            error={errors.phone?.message}
                            {...register("phone", {
                                required: "Phone number is required",
                                pattern: {
                                    value: /^[6-9]\d{9}$/,
                                    message:
                                        "Enter a valid 10-digit Indian mobile number",
                                },
                            })}
                        />

                        <FormInput
                            label="Mail ID"
                            type="email"
                            autoComplete="email"
                            placeholder="Enter email address"
                            required
                            error={errors.email?.message}
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "Enter a valid email address",
                                },
                            })}
                        />

                    </fieldset>

                </div>

                {/* ADDRESS DETAILS */}

                <div className="address-form">

                    <fieldset className="fieldset">

                        <Typography
                            variant="h5"
                            className="address-form__heading m-0"
                        >
                            Address
                        </Typography>

                        {/* ADDRESS LINE 1 */}

                        <FormInput
                            label="Address Line 1"
                            autoComplete="address-line1"
                            placeholder="House number, street, area"
                            required
                            error={errors.addressLine1?.message}
                            {...register("addressLine1", {
                                required: "Address Line 1 is required",
                                minLength: {
                                    value: 5,
                                    message: "Enter a complete address",
                                },
                                maxLength: {
                                    value: 150,
                                    message: "Maximum 150 characters allowed",
                                },
                            })}
                        />

                        {/* ADDRESS LINE 2 */}

                        <FormInput
                            label="Address Line 2"
                            autoComplete="address-line2"
                            placeholder="Landmark, apartment, etc. (optional)"
                            error={errors.addressLine2?.message}
                            {...register("addressLine2", {
                                maxLength: {
                                    value: 150,
                                    message: "Maximum 150 characters allowed",
                                },
                            })}
                        />

                        {/* PINCODE / COUNTRY / STATE / CITY / BLOCK */}

                        <div className="address-form-3__grid">

                            {/* PINCODE */}

                            <div>

                                <FormInput
                                    label="Pincode"
                                    inputMode="numeric"
                                    autoComplete="postal-code"
                                    placeholder="6-digit pincode"
                                    maxLength={6}
                                    required
                                    error={errors.pincode?.message}
                                    {...register("pincode", {
                                        required: "Pincode is required",
                                        pattern: {
                                            value: /^[1-9]\d{5}$/,
                                            message:
                                                "Enter a valid 6-digit Indian pincode",
                                        },
                                        onChange: (event) => {
                                            const value =
                                                event.target.value
                                                    .replace(/\D/g, "")
                                                    .slice(0, 6);

                                            event.target.value = value;
                                        },
                                    })}
                                />

                                {pincodeLoading && (
                                    <Typography
                                        className="form-error m-0"
                                      
                                    >
                                        Fetching address details...
                                    </Typography>
                                )}

                                {!pincodeLoading && pincodeMessage && (
                                    <Typography
                                        className={`m-0 ${
                                            pincodeError
                                                ? "form-error"
                                                : "form-suceess"
                                        }`}
                                    >
                                        {pincodeMessage}
                                    </Typography>
                                )}

                            </div>

                            {/* COUNTRY */}
                            

                            <Controller
                                name="country"
                                control={control}
                                rules={{
                                    required: "Please select a country",
                                }}
                                render={({ field, fieldState }) => (
                                    <FormSelect
                                        variant="outline"
                                        name={field.name}
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        label="Country"
                                        options={countryOptions}
                                        placeholder="Select country"
                                        required
                                        error={fieldState.error?.message}
                                    />
                                )}
                            />

                            {/* STATE */}

                            <Controller
                                name="state"
                                control={control}
                                rules={{
                                    required: "Please select a state",
                                }}
                                render={({ field, fieldState }) => (
                                    <FormSelect
                                        name={field.name}
                                        value={field.value}
                                        onBlur={field.onBlur}
                                        onChange={(event) => {
                                            field.onChange(event);

                                            setValue("city", "", {
                                                shouldValidate: true,
                                                shouldDirty: true,
                                            });
                                        }}
                                        label="State"
                                        options={availableStateOptions}
                                        placeholder="Select state"
                                        required
                                        error={fieldState.error?.message}
                                    />
                                )}
                            />
                            </div>
                            <div className="address-form__grid">

                            {/* CITY / DISTRICT */}

                            <Controller
                                name="city"
                                control={control}
                                rules={{
                                    required: "Please select a city",
                                }}
                                render={({ field, fieldState }) => (
                                    <FormSelect
                                        name={field.name}
                                        value={field.value}
                                        onChange={field.onChange}
                                        onBlur={field.onBlur}
                                        label="City / District"
                                        options={cityOptions}
                                        placeholder={
                                            selectedState
                                                ? "Select city"
                                                : "Select state first"
                                        }
                                        disabled={!selectedState}
                                        required
                                        error={fieldState.error?.message}
                                    />
                                )}
                            />

                            {/* BLOCK */}

                            <FormInput
                                
                                placeholder="Enter block / taluk"
                                {...register("block")}
                            />

                        </div>

                    </fieldset>

                </div>

            </div>

            {/* FORM ACTIONS */}

            <div className="address-form__actions">

                <Button
                    type="submit"
                    color="secondary"
                    curve="full"
                    className="address-form__button address-form__button--primary"
                    disabled={busy || pincodeLoading}
                >
                    {busy
                        ? "Saving..."
                        : initialValues?.id
                            ? "Update Address"
                            : "Add Address"}
                </Button>

                {onCancel && (
                    <Button
                        variant="outline"
                        type="button"
                        color="secondary"
                        curve="full"
                        className="address-form__button address-form__button--secondary"
                        onClick={onCancel}
                        disabled={busy}
                    >
                        Cancel
                    </Button>
                )}

            </div>

        </form>
    );
}
