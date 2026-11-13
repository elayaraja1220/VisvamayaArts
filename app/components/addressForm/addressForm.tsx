"use client";

import { useEffect, useState } from "react";

import {
    Controller,
    useForm,
    type SubmitHandler,
} from "react-hook-form";

import "./addressForm.css";

import { FormInput } from "../forms";
import Autocomplete from "../forms/autocomplete";
import Button from "../button/button";
import Typography from "../typegrophy/typography";

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

// Free, key-less APIs:
// - CountriesNow: country / state / city lists for every country
// - India Post (postalpincode.in): India pincode -> state, district, block
// - Nominatim (OpenStreetMap): any country's postal code -> country, state, city
//   Usage policy: max 1 request/second, so lookups are debounced.
const COUNTRIES_API = "https://countriesnow.space/api/v0.1/countries";
const INDIA_PINCODE_API = "https://api.postalpincode.in/pincode";
const NOMINATIM_API = "https://nominatim.openstreetmap.org/search";

type CountryItem = {
    name: string;
    code: string;
};

type CountriesNowResponse<T> = {
    error: boolean;
    msg: string;
    data: T;
};

type NominatimResult = {
    address?: {
        country?: string;
        state?: string;
        region?: string;
        state_district?: string;
        county?: string;
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        city_district?: string;
        suburb?: string;
    };
};

type PostalLookupResult = {
    country: string;
    state: string;
    city: string;
    blocks: string[];
} | null;

const INDIA_PINCODE = /^[1-9]\d{5}$/;

const unique = (items: (string | null | undefined)[]) =>
    Array.from(
        new Set(
            items
                .map((item) => (item ?? "").trim())
                .filter((item) => item && item.toUpperCase() !== "NA")
        )
    );

type TextAutocompleteProps = {
    name: string;
    label: string;
    placeholder: string;
    options: string[];
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    emptyMessage?: string;
    noOptionsMessage?: string;
};

// Free-text dropdown: pick from the list (arrow opens all options)
// or type any value — the typed text is stored as the field value.
function TextAutocomplete({
    value,
    onChange,
    error,
    ...props
}: TextAutocompleteProps) {
    return (
        <div>
            <Autocomplete<string>
                {...props}
                getOptionLabel={(option) => option}
                getOptionValue={(option) => option}
                matchMode="startsWith"
                value={value || null}
                inputValue={value ?? ""}
                onInputChange={onChange}
                onChange={(next) => onChange(next == null ? "" : String(next))}
                minQueryLength={1}
                maxResults={500}
                showArrow
            />

            {error && (
                <Typography className="form-error m-0">
                    {error}
                </Typography>
            )}
        </div>
    );
}

async function fetchJson<T>(
    url: string,
    signal: AbortSignal
): Promise<T | null> {
    const response = await fetch(url, { signal });

    if (response.status === 404) return null;

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

async function lookupIndiaPincode(
    code: string,
    signal: AbortSignal
): Promise<PostalLookupResult> {
    const result = await fetchJson<PostalResponse[]>(
        `${INDIA_PINCODE_API}/${code}`,
        signal
    );

    const offices = result?.[0]?.PostOffice ?? [];

    if (result?.[0]?.Status !== "Success" || !offices.length) {
        return null;
    }

    return {
        country: "India",
        state: offices[0].State || "",
        city: offices[0].District || "",
        blocks: unique(offices.map((office) => office.Block)),
    };
}

async function lookupWorldPostalCode(
    code: string,
    preferredCountry: string,
    signal: AbortSignal
): Promise<PostalLookupResult> {
    const params = new URLSearchParams({
        postalcode: code,
        format: "jsonv2",
        addressdetails: "1",
        "accept-language": "en",
        limit: "20",
    });

    const results =
        (await fetchJson<NominatimResult[]>(
            `${NOMINATIM_API}?${params}`,
            signal
        )) ?? [];

    // Same postal code can exist in several countries:
    // prefer the selected country, otherwise take the best match.
    const match =
        results.find(
            (item) => item.address?.country === preferredCountry
        ) ?? results[0];

    const address = match?.address;

    if (!address?.country) return null;

    const sameCountry = results
        .map((item) => item.address)
        .filter((item) => item?.country === address.country);

    return {
        country: address.country,
        state: address.state || address.region || "",
        city:
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.county ||
            "",
        blocks: unique(
            sameCountry.flatMap((item) => [
                item?.county,
                item?.state_district,
                item?.city_district,
                item?.suburb,
            ])
        ),
    };
}

async function lookupPostalCode(
    code: string,
    preferredCountry: string,
    signal: AbortSignal
): Promise<PostalLookupResult> {
    const looksIndian = INDIA_PINCODE.test(code);

    if (looksIndian && (!preferredCountry || preferredCountry === "India")) {
        const india = await lookupIndiaPincode(code, signal);

        if (india) return india;
    }

    const world = await lookupWorldPostalCode(
        code,
        preferredCountry,
        signal
    );

    if (world) return world;

    if (looksIndian && preferredCountry && preferredCountry !== "India") {
        return lookupIndiaPincode(code, signal);
    }

    return null;
}

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

export default function AddressForm({
    initialValues,
    userDetails,
    submitting = false,
    onSubmit,
    onCancel,
}: AddressFormProps) {

    const {
        register,
        control,
        handleSubmit,
        reset,
        setValue,
        getValues,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<AddressFormValues>({
        defaultValues: {
            ...EMPTY_VALUES,
            ...initialValues,
        },
        mode: "onBlur",
    });

    const [pincodeLoading, setPincodeLoading] = useState(false);

    const [pincodeMessage, setPincodeMessage] = useState("");

    const [pincodeError, setPincodeError] = useState(false);

    const firstName = watch("receiverFirstName");
    const lastName = watch("receiverLastName");
    const phone = watch("phone");
    const email = watch("email");

    const pincode = watch("pincode");

    const selectedCountry = watch("country");
    const selectedState = watch("state");

    const [countries, setCountries] = useState<CountryItem[]>([]);
    const [states, setStates] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [blocks, setBlocks] = useState<string[]>([]);

    // Country / state / city / block stay locked until a pincode lookup
    // has finished (success or failure), then they become editable.
    const [addressUnlocked, setAddressUnlocked] = useState(false);

    // Load all countries once
    useEffect(() => {
        const controller = new AbortController();

        fetchJson<CountriesNowResponse<{ name: string; Iso2: string }[]>>(
            `${COUNTRIES_API}/iso`,
            controller.signal
        )
            .then((result) => {
                if (!result || result.error) return;

                setCountries(
                    result.data
                        .map((item) => ({ name: item.name, code: item.Iso2 }))
                        .sort((a, b) => a.name.localeCompare(b.name))
                );
            })
            .catch((error) => {
                if (error?.name !== "AbortError") {
                    console.error("Country list error:", error);
                }
            });

        return () => controller.abort();
    }, []);

    // Load states whenever the country changes (debounced: country can be typed)
    useEffect(() => {
        setStates([]);

        if (!selectedCountry) return;

        const controller = new AbortController();

        const timer = setTimeout(() => {
            fetchJson<CountriesNowResponse<{ states: { name: string }[] }>>(
                `${COUNTRIES_API}/states/q?country=${encodeURIComponent(selectedCountry)}`,
                controller.signal
            )
                .then((result) => {
                    if (!result || result.error) return;

                    setStates(result.data.states.map((item) => item.name));
                })
                .catch((error) => {
                    if (error?.name !== "AbortError") {
                        console.error("State list error:", error);
                    }
                });
        }, 500);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [selectedCountry]);

    // Load cities whenever the state changes (debounced: state can be typed)
    useEffect(() => {
        setCities([]);

        if (!selectedCountry || !selectedState) return;

        const controller = new AbortController();

        const timer = setTimeout(() => {
            fetchJson<CountriesNowResponse<string[]>>(
                `${COUNTRIES_API}/state/cities/q?country=${encodeURIComponent(
                    selectedCountry
                )}&state=${encodeURIComponent(selectedState)}`,
                controller.signal
            )
                .then((result) => {
                    if (!result || result.error) return;

                    setCities(result.data);
                })
                .catch((error) => {
                    if (error?.name !== "AbortError") {
                        console.error("City list error:", error);
                    }
                });
        }, 500);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [selectedCountry, selectedState]);

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

    useEffect(() => {
        reset({
            ...EMPTY_VALUES,
            ...initialValues,
        });

        setPincodeMessage("");
        setPincodeError(false);
    }, [initialValues, reset]);

    // Postal code -> country, state, city, block (any country)
    useEffect(() => {
        const code = (pincode ?? "").trim().toUpperCase();

        setPincodeMessage("");
        setPincodeError(false);
        setAddressUnlocked(false);

        if (code.length < 3) {
            setPincodeLoading(false);
            setBlocks([]);
            return;
        }

        let cancelled = false;

        const controller = new AbortController();

        const timer = setTimeout(async () => {
            setPincodeLoading(true);

            try {
                const result = await lookupPostalCode(
                    code,
                    getValues("country"),
                    controller.signal
                );

                if (cancelled) return;

                if (!result) {
                    setBlocks([]);
                    setPincodeError(true);

                    setPincodeMessage(
                        "No details found for this pincode. Please select country, state and city manually."
                    );

                    return;
                }

                const options = { shouldValidate: true, shouldDirty: true };

                const currentBlock = getValues("block");

                setBlocks(result.blocks);

                setValue("country", result.country, options);
                setValue("state", result.state, options);
                setValue("city", result.city, options);
                setValue(
                    "block",
                    result.blocks.includes(currentBlock)
                        ? currentBlock
                        : result.blocks[0] ?? "",
                    options
                );

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
                    "Unable to fetch address details. Please select country, state and city manually."
                );

            } finally {
                if (!cancelled) {
                    setPincodeLoading(false);
                    setAddressUnlocked(true);
                }
            }
        }, 800);

        return () => {
            cancelled = true;
            clearTimeout(timer);
            controller.abort();
        };

    }, [pincode, getValues, setValue]);

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

    const countryNames = countries.map((item) => item.name);

    const busy = submitting || isSubmitting;

    return (
        <form
            className="address-form"
            onSubmit={handleSubmit(submitHandler)}
            noValidate
        >
            <div className="scroll-address-body">

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

                <div className="address-form">

                    <fieldset className="fieldset">

                        <Typography
                            variant="h5"
                            className="address-form__heading m-0"
                        >
                            Address
                        </Typography>

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

                        <div className="address-form-3__grid">

                            <div>

                                <FormInput
                                    label="Pincode / Postal Code"
                                    autoComplete="postal-code"
                                    placeholder="e.g. 600001, 90210, SW1A 1AA"
                                    maxLength={10}
                                    required
                                    error={errors.pincode?.message}
                                    {...register("pincode", {
                                        required: "Pincode is required",
                                        validate: (value, values) => {
                                            const code = value.trim();

                                            if (values.country === "India") {
                                                return (
                                                    INDIA_PINCODE.test(code) ||
                                                    "Enter a valid 6-digit Indian pincode"
                                                );
                                            }

                                            return (
                                                /^[A-Za-z0-9][A-Za-z0-9 -]{1,9}$/.test(code) ||
                                                "Enter a valid postal code"
                                            );
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

                            <Controller
                                name="country"
                                control={control}
                                rules={{
                                    required: "Please select a country",
                                }}
                                render={({ field, fieldState }) => (
                                    <TextAutocomplete
                                        name={field.name}
                                        label="Country"
                                        placeholder="Select or type country"
                                        options={countryNames}
                                        value={field.value}
                                        onChange={(value) => {
                                            if (value === field.value) return;

                                            field.onChange(value);

                                            setValue("state", "");
                                            setValue("city", "");
                                            setValue("block", "");
                                            setBlocks([]);
                                        }}
                                        required
                                        error={fieldState.error?.message}
                                        emptyMessage="No match — your typed country will be used."
                                        noOptionsMessage="No countries loaded — type your country."
                                        disabled={!addressUnlocked}
                                    />
                                )}
                            />

                            <Controller
                                name="state"
                                control={control}
                                render={({ field }) => (
                                    <TextAutocomplete
                                        name={field.name}
                                        label="State"
                                        placeholder="Select or type state"
                                        options={states}
                                        value={field.value}
                                        onChange={(value) => {
                                            if (value === field.value) return;

                                            field.onChange(value);

                                            setValue("city", "");
                                        }}
                                        emptyMessage="No match — your typed state will be used."
                                        noOptionsMessage="No states loaded — type your state."
                                        disabled={!addressUnlocked}
                                    />
                                )}
                            />
                            </div>
                            <div className="address-form__grid">

                            {/* All four fields: pick from the list (arrow) or type any value */}
                            <Controller
                                name="city"
                                control={control}
                                render={({ field }) => (
                                    <TextAutocomplete
                                        name={field.name}
                                        label="City / District"
                                        placeholder="Select or type city"
                                        options={cities}
                                        value={field.value}
                                        onChange={field.onChange}
                                        emptyMessage="No match — your typed city will be used."
                                        noOptionsMessage="No cities loaded — type your city."
                                        disabled={!addressUnlocked}
                                    />
                                )}
                            />

                            <Controller
                                name="block"
                                control={control}
                                render={({ field }) => (
                                    <TextAutocomplete
                                        name={field.name}
                                        label="Block / Taluk"
                                        placeholder="Select or type block / taluk"
                                        options={blocks}
                                        value={field.value}
                                        onChange={field.onChange}
                                        emptyMessage="No match — your typed block will be used."
                                        noOptionsMessage="No blocks found — type your block / taluk."
                                        disabled={!addressUnlocked}
                                    />
                                )}
                            />

                        </div>

                    </fieldset>

                </div>

            </div>

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
