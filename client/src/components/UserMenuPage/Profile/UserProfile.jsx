import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import {
  Box,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user profile data
    fetch(`/api/users/${id}`)
      .then((response) => response.json())
      .then((data) => setUser(data))
      .catch((error) => console.error("Error fetching user data:", error));
  }, [id]);

  const initialValues = user || {
    first_name: "",
    last_name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: "",
    push_notifications: false,
    geolocation_on: false,
    username: "",
    password: "",
  };

  const validationSchema = Yup.object({
    first_name: Yup.string().required("Required"),
    last_name: Yup.string().required("Required"),
    address: Yup.string().required("Required"),
    city: Yup.string().required("Required"),
    state: Yup.string().required("Required"),
    zip: Yup.string().required("Required"),
    phone: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    username: Yup.string().required("Required"),
    password: Yup.string().required("Required"),
  });

  if (!user) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box p="4">
      <Text fontSize="xl">User Profile</Text>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          fetch(`/api/users/${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          })
            .then((response) => response.json())
            .then((data) => {
              setUser(data);
              setSubmitting(false);
              navigate("/usermenu/profile");
            })
            .catch((error) => {
              console.error("Error updating user data:", error);
              setSubmitting(false);
            });
        }}
        enableReinitialize
      >
        {({ isSubmitting }) => (
          <Form>
            <Table>
              <Tbody>
                <Tr>
                  <Td>
                    <FormControl>
                      <FormLabel>First Name</FormLabel>
                      <Field name="first_name" as={Input} />
                      <ErrorMessage name="first_name" component="div" />
                    </FormControl>
                  </Td>
                  <Td>
                    <FormControl>
                      <FormLabel>Last Name</FormLabel>
                      <Field name="last_name" as={Input} />
                      <ErrorMessage name="last_name" component="div" />
                    </FormControl>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <FormControl>
                      <FormLabel>Address</FormLabel>
                      <Field name="address" as={Input} />
                      <ErrorMessage name="address" component="div" />
                    </FormControl>
                  </Td>
                  <Td>
                    <FormControl>
                      <FormLabel>City</FormLabel>
                      <Field name="city" as={Input} />
                      <ErrorMessage name="city" component="div" />
                    </FormControl>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <FormControl>
                      <FormLabel>State</FormLabel>
                      <Field name="state" as={Input} />
                      <ErrorMessage name="state" component="div" />
                    </FormControl>
                  </Td>
                  <Td>
                    <FormControl>
                      <FormLabel>ZIP Code</FormLabel>
                      <Field name="zip" as={Input} />
                      <ErrorMessage name="zip" component="div" />
                    </FormControl>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <FormControl>
                      <FormLabel>Phone</FormLabel>
                      <Field name="phone" as={Input} />
                      <ErrorMessage name="phone" component="div" />
                    </FormControl>
                  </Td>
                  <Td>
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Field name="email" as={Input} />
                      <ErrorMessage name="email" component="div" />
                    </FormControl>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <FormControl>
                      <FormLabel>Username</FormLabel>
                      <Field name="username" as={Input} />
                      <ErrorMessage name="username" component="div" />
                    </FormControl>
                  </Td>
                  <Td>
                    <FormControl>
                      <FormLabel>Password</FormLabel>
                      <Field name="password" type="password" as={Input} />
                      <ErrorMessage name="password" component="div" />
                    </FormControl>
                  </Td>
                </Tr>
                <Tr>
                  <Td>
                    <FormControl>
                      <FormLabel>Push Notifications</FormLabel>
                      <Field name="push_notifications" type="checkbox" as={Input} />
                    </FormControl>
                  </Td>
                  <Td>
                    <FormControl>
                      <FormLabel>Geolocation On</FormLabel>
                      <Field name="geolocation_on" type="checkbox" as={Input} />
                    </FormControl>
                  </Td>
                </Tr>
              </Tbody>
            </Table>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update"}
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

export default UserProfile;

