/**
 * source from: https://github.com/sanidhya711/text-on-gif
 * 优化代码结构，修复部分逻辑错误关系，添加 maxWidth 逻辑，调整折行绘制过程。
 */

import gifFrames from 'gif-frames' ;
import GIFEncoder from 'gif-encoder-2';
import Canvas from 'canvas';
import Events from 'events';
import * as fs from 'fs';
import {fillText} from './base.js';

class TextGif extends Events {

  #file_path;
  #transparent;
  #width;
  #height;
  #noOfFrames;
  #retained;

  constructor({
    file_path,
    options,
    repeat,
    transparent
  }) {
    super();
    this.options = options ?? {
      x: 0,
      y: 0,
      max: 100,
      font: '32px sans-serif',
      color: 'black',
      stroke: 'transparent',
      swidth: 1,
      align: 'center',
      direction: 'center'
    };
    this.repeat = repeat ?? 0;

    this.#file_path = file_path;
    this.#transparent = transparent ?? false;

    this.extractedFrames = [];
    this.extractionComplete = false;

    this.#extractFrames();
  }

  async #extractFrames() {
    const frameData = await gifFrames({url: this.#file_path, frames: 'all', outputType: 'png', cumulative: false});

    this.#width = frameData[0].frameInfo.width;
    this.#height = frameData[0].frameInfo.height;
    this.#noOfFrames = frameData.length;
    this.emit('extracted frame info');

    for (let index = 0; index < frameData.length; index++) {
      await new Promise(resolve => {
        const image = new Canvas.Image();
        image.onload = () => {
          this.extractedFrames.push({
            imageData: image,
            delay: frameData[index].frameInfo.delay * 10,
            disposal: frameData[index].frameInfo.disposal
          });

          fs.unlink('frame-' + index + '.png', () => {});
          resolve();
        };

        const writeStream = frameData[index].getImage().pipe(fs.createWriteStream('frame-' + index + '.png'));
        
        writeStream.on('finish', () => {
          image.src = 'frame-' + index + '.png';
        });
      });
    }
    
    this.extractionComplete = true;
    this.emit('extraction complete');
  }

  async #writeMessage(text, get_as_buffer, write_path, retain) {
    let encoder = null;
    if (write_path || get_as_buffer) {
      encoder = new GIFEncoder(this.#width, this.#height, 'neuquant', false, this.extractedFrames.length);
      if (this.#transparent) {
        encoder.setTransparent(true);
      }
      encoder.setRepeat(this.repeat);
    }

    const canvas = Canvas.createCanvas(this.#width, this.#height);
    const ctx = canvas.getContext('2d');

    if (write_path && !get_as_buffer) {
      const writeStream = fs.createWriteStream(write_path);
      writeStream.on('error', error => {
        return Promise.reject(error);
      });
      encoder.createReadStream().pipe(writeStream);
    }

    if (encoder) {
      encoder.start();

      encoder.on('progress', percent => {
        this.emit('progress', percent);
      });
    }

    for (let index = 0; index < this.extractedFrames.length; index++) {
      this.emit('on frame', index + 1);

      if (!this.#retained) {
        ctx.drawImage(this.extractedFrames[index].imageData, 0, 0);
      } else {
        ctx.putImageData(this.extractedFrames[index].imageData, 0, 0);
      }

      fillText(ctx, this.#width, text, this.options);

      let withoutText = null;
      if (this.extractedFrames[index].disposal !== 2) {
        withoutText = ctx.getImageData(0, 0, this.#width, this.#height);
      }

      if (encoder) {
        encoder.setDelay(this.extractedFrames[index].delay);
        encoder.setDispose(this.extractedFrames[index].disposal);
        encoder.addFrame(ctx);
      }

      if (retain) {
        this.extractedFrames[index].imageData = ctx.getImageData(0, 0, this.#width, this.#height);
      }

      if (this.extractedFrames[index].disposal == 2) {
        ctx.clearRect(0, 0, this.#width, this.#height);
      } else {
        ctx.putImageData(withoutText, 0, 0);
      }
    }

    this.#retained = this.#retained ? true : retain;
    if (encoder) {
      encoder.finish();
    }
    this.emit('finished');

    if (get_as_buffer && write_path) {
      await new Promise((resolve, reject) => {
        fs.writeFile(write_path, encoder.out.getData(), error => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    }
      
    if (get_as_buffer) {
      return Promise.resolve(encoder.out.getData());
    } else {
      return null;
    }
  }

  async textGif({text, get_as_buffer, write_path, retain}) {
    get_as_buffer = get_as_buffer ?? true;
    retain = retain ?? false;
    let buffer = null;

    if (this.extractionComplete) {
      buffer = await this.#writeMessage(text, get_as_buffer, write_path, retain);
    } else {
      await new Promise(resolve => {
        this.on('extraction complete', async () => {
          buffer = await this.#writeMessage(text, get_as_buffer, write_path, retain);
          resolve();
        });
      });
    }

    if (buffer) {
      return Promise.resolve(buffer);
    }
  }

  static registerFont({path, family}) {
    Canvas.registerFont(path, {family: family});
  }

  get width() {
    if (this.#width) {
      return Promise.resolve(this.#width);
    } else {
      return new Promise(resolve => {
        this.on('extracted frame info', () => {
          resolve(this.#width);
        });
      });
    }
  }

  get height() {
    if (this.#height) {
      return Promise.resolve(this.#height);
    } else {
      return new Promise(resolve => {
        this.on('extracted frame info', () => {
          resolve(this.#height);
        });
      });
    }
  }

    get noOfFrames() {
      if (this.#noOfFrames) {
        return Promise.resolve(this.#noOfFrames);
      } else {
        return new Promise(resolve => {
          this.on('extracted frame info', () => {
            resolve(this.#noOfFrames);
          });
        });
      }
    }

  get file_path() {
    return this.#file_path;
  }
}

export {
  TextGif
};
