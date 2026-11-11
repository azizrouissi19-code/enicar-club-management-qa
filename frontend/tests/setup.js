import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// react-router v7 a besoin de TextEncoder, absent de jsdom
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

beforeEach(() => localStorage.clear());
