import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  HostListener
} from "@angular/core";

@Directive({
  selector: "[ccMarkDown]"
})
export class MarkdownDirective implements OnInit {
  @Input() value: string;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.el.nativeElement.style.backgroundColor = this.value;
    this.el.nativeElement.innerHTML = `${this.value}`;
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes.input) {
      console.log("input changed");
    }
    console.log("input changed");
  }
  makeMarkDownToHtml = async input => {
    function getIndicesOf(searchStr, str, caseSensitive) {
      /* Usage
      let indices = getIndicesOf("le", "I learned to play the Ukulele in Lebanon.")
      indices: [2, 25, 27, 33]
      */
      var searchStrLen = searchStr.length;
      if (searchStrLen == 0) {
        return [];
      }
      var startIndex = 0,
        index,
        indices = [];
      if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
      }
      while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
      }
      return indices;
    }

    /* get closest opening point */
    function getClosestOpeningOfLink(openIndexed, closeIndex) {
      let array = openIndexed;
      let answer = 0;
      array.forEach(value => {
        if (value < closeIndex && value >= answer) {
          answer = value;
        }
      });
      return answer;
    }
    /* Creation Of Link Objects */
    const extractLinks = async input => {
      let openFormatter = "[[";
      let closingFormatter = "]]";
      let openIndexes = getIndicesOf(openFormatter, input);
      let closeIndexes = getIndicesOf(closingFormatter, input);
      const makePair = async (array1, array2) => {
        let pair = [];
        array2.forEach(value => {
          let startValue = getClosestOpeningOfLink(array1, value);
          let endValue = value;
          let obj = {
            startValue,
            endValue
          };
          pair.push(obj);
        });
        return pair;
      };
      let pairOfOpenCloseIndexes = await makePair(openIndexes, closeIndexes);
      const makeLinkObjects = async (pairOfOpenCloseIndexes, input) => {
        const createHtmlForLink = string => {
          let array = string.split("|");
          let href = array[0].trim();
          let content = array[1];
          return `<a href="${href}">${content}</a>`;
        };
        let linkObjects = [];
        pairOfOpenCloseIndexes.forEach(value => {
          let newObj = {};
          newObj.startValue = value.startValue;
          newObj.endValue = value.endValue + 2;
          let string = input.substring(value.startValue + 2, value.endValue);
          newObj.stringToReplace = `[[${string}]]`;
          newObj.html = createHtmlForLink(string);
          linkObjects.push(newObj);
        });
        return linkObjects;
      };

      let linkObjects = await makeLinkObjects(pairOfOpenCloseIndexes, input);
      const removeLinksFromInput = async (input, linkObjects) => {
        let string = input;
        let reducedString;
        await linkObjects.forEach(value => {
          let subString = string.substring(value.startValue, value.endValue);
          reducedString = string.replace(subString, "");
        });
        return reducedString;
      };
      let reducedInputString = await removeLinksFromInput(input, linkObjects);
      return {
        linkObjects,
        reducedInputString
      };
    };

    const makeFormatterObject = (
      formatterIndexes,
      input,
      formatter,
      htmlToReplaceWith
    ) => {
      let formatterObjects = [];
      formatterIndexes.forEach((value, index) => {
        if (index % 2 != 0) {
          let string = input.substring(formatterIndexes[index - 1] + 2, value);
          let startValue = formatterIndexes[index - 1];
          let endValue = value + 2;
          formatterObjects.push({
            startValue,
            endValue,
            html: `<${htmlToReplaceWith}>${string}</${htmlToReplaceWith}>`,
            stringToReplace: `${formatter}${string}${formatter}`
          });
        }
      });
      return formatterObjects;
    };
    /* create italics Object */
    const createItalicObjects = async (input, formatter, htmlToReplaceWith) => {
      let formatterIndexes = getIndicesOf("//", input);
      return makeFormatterObject(
        formatterIndexes,
        input,
        formatter,
        htmlToReplaceWith
      );
    };

    /* create Bold Object */
    const createBoldObjects = async (input, formatter, htmlToReplaceWith) => {
      let formatterIndexes = getIndicesOf(formatter, input);
      return makeFormatterObject(
        formatterIndexes,
        input,
        formatter,
        htmlToReplaceWith
      );
    };
    const createHtmlFromInput = (input, formatedObjectsArray) => {
      let string = input;
      formatedObjectsArray.forEach(value => {
        string = string.replace(value.stringToReplace, value.html);
      });
      return string;
    };
    let linkObjects, reducedInputString;
    let resOFExtractLinks = await extractLinks(input);
    linkObjects = resOFExtractLinks.linkObjects;
    reducedInputString = resOFExtractLinks.reducedInputString;
    let italicObjects = await createItalicObjects(
      reducedInputString,
      "//",
      "em"
    );
    let boldObjects = await createBoldObjects(
      reducedInputString,
      "**",
      "strong"
    );

    let formatedObjectsArray = linkObjects.concat(
      italicObjects.concat(boldObjects)
    );
    // console.log('formatedObjectsArray: ', formatedObjectsArray)

    let result = createHtmlFromInput(input, formatedObjectsArray);
    console.log("input: ", input);
    // console.log('result: ', result)
    return `<p>${result}</p>`;
  };

  // makeMarkDownToHtml(input).then(res => {
  //   console.log(res);
  // });
}
