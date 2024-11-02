type Callback1Boolean<Input> = (input: Input) => boolean;
type Callback2Boolean<Input1, Input2> = (
    input1: Input1,
    input2: Input2
) => boolean;
type Callback<Response> = () => Response;
type Callback1<Input, Response> = (input: Input) => Response;
type Callback2<Input1, Input2, Response> = (
    input1: Input1,
    input2: Input2
) => Response;
type Callback1Void<Input> = (input: Input) => void;
type Callback2Void<Input1, Input2> = (input1: Input1, input2: Input2) => void;
type Callback3Void<Input1, Input2, Input3> = (
    input1: Input1,
    input2: Input2,
    input3: Input3
) => void;

export {
    Callback,
    Callback1,
    Callback2,
    Callback1Void,
    Callback2Void,
    Callback3Void,
    Callback1Boolean,
    Callback2Boolean,
};
