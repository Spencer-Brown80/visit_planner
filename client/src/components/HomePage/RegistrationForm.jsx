import React, { useContext } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Box, Button, FormControl, FormLabel, Input, VStack, Text, Center } from "@chakra-ui/react";
import UserContext from "../../UserContext";
import { useNavigate } from "react-router-dom";

const RegistrationForm = ({ onShowLogin }) => {
  const { setIsLogin } = useContext(UserContext);
  const navigate = useNavigate();

  const initialValues = {
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    email: "",
  };

  const validationSchema = Yup.object({
    first_name: Yup.string().required("Required"),
    last_name: Yup.string().required("Required"),
    username: Yup.string().required("Required"),
    password: Yup.string().required("Required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Required"),
    phone: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email address").required("Required"),
  });

  const handleSubmit = (values, { setSubmitting }) => {
    fetch("/api/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Registration failed");
        }
        return response.json();
      })
      .then(() => {
        setSubmitting(false);
        setIsLogin(true);
        navigate("/user");
      })
      .catch((error) => {
        console.error("Error:", error);
        setSubmitting(false);
      });
  };

  return (
    <Center height="100vh">
      <Box width="100%" maxW="400px" p={4} boxShadow="lg" borderRadius="md" mt={20}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>First Name</FormLabel>
                  <Field name="first_name" as={Input} />
                  <ErrorMessage name="first_name" component="div" className="error" />
                </FormControl>

                <FormControl>
                  <FormLabel>Last Name</FormLabel>
                  <Field name="last_name" as={Input} />
                  <ErrorMessage name="last_name" component="div" className="error" />
                </FormControl>

                <FormControl>
                  <FormLabel>Username</FormLabel>
                  <Field name="username" as={Input} />
                  <ErrorMessage name="username" component="div" className="error" />
                </FormControl>

                <FormControl>
                  <FormLabel>Password</FormLabel>
                  <Field name="password" type="password" as={Input} />
                  <ErrorMessage name="password" component="div" className="error" />
                </FormControl>

                <FormControl>
                  <FormLabel>Confirm Password</FormLabel>
                  <Field name="confirmPassword" type="password" as={Input} />
                  <ErrorMessage name="confirmPassword" component="div" className="error" />
                </FormControl>

                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Field name="phone" as={Input} />
                  <ErrorMessage name="phone" component="div" className="error" />
                </FormControl>

                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Field name="email" type="email" as={Input} />
                  <ErrorMessage name="email" component="div" className="error" />
                </FormControl>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Registering..." : "Register"}
                </Button>

                <Text>
                  Already have an account?{" "}
                  <Text as="span" color="blue.500" cursor="pointer" onClick={onShowLogin}>
                    Login Here
                  </Text>
                </Text>
              </VStack>
            </Form>
          )}
        </Formik>
      </Box>
    </Center>
  );
};

export default RegistrationForm;




