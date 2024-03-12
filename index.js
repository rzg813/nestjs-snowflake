var Snowflake = (function () {
  function Snowflake(_workerId, _dataCenterId) {
      /** 开始时间截 ：2019-12-20 13:52:35 */
      this.twepoch = 1609343999999n;
      /** 机器id所占的位数 */
      this.workerIdBits = 5n;
      /** 数据标识id所占的位数 */
      this.dataCenterIdBits = 5n;
      this.maxWrokerId = -1n ^ (-1n << this.workerIdBits); // 值为：31
      /** 支持的最大数据标识id，结果是31 */
      this.maxDataCenterId = -1n ^ (-1n << this.dataCenterIdBits); // 值为：31
      /** 序列在id中占的位数 */
      this.sequenceBits = 12n;
      /** 机器ID向左移12位 */
      this.workerIdShift = this.sequenceBits; // 值为：12
      /** 数据标识id向左移17位(12序列id+5机器ID) */
      this.dataCenterIdShift = this.sequenceBits + this.workerIdBits; // 值为：17
      /** 时间截向左移22位( 12序列id + 5机器ID + 5数据ID) */
      this.timestampLeftShift = this.sequenceBits + this.workerIdBits + this.dataCenterIdBits; // 值为：22
      this.sequenceMask = -1n ^ (-1n << this.sequenceBits); // 值为：4095
      /** 上次生成ID的时间截 */
      this.lastTimestamp = -1n;

      this.workerId = BigInt(_workerId || 0n);         //工作机器ID(0~31)
      this.dataCenterId = BigInt(_dataCenterId || 0n); //数据标识ID(0~31)
      this.sequence = 0n;                              //毫秒内序列(0~4095)

      // workerId 校验
      if (this.workerId > this.maxWrokerId || this.workerId < 0) {
          throw new Error(`workerId must max than 0 and small than maxWrokerId ${this.maxWrokerId}`);
      }
      // dataCenterId 校验
      if (this.dataCenterId > this.maxDataCenterId || this.dataCenterId < 0) {
          throw new Error(`dataCenterId must max than 0 and small than maxDataCenterId ${this.maxDataCenterId}`);
      }
  }
  /**
   * 获得下一个ID (该方法是线程安全的)
   * @return SnowflakeId
   */
  Snowflake.prototype.nextId = function () {
      var timestamp = this.timeGen();

      //如果当前时间小于上一次ID生成的时间戳，说明系统时钟回退过这个时候应当抛出异常
      if (timestamp < this.lastTimestamp) {
          throw new Error('Clock moved backwards. Refusing to generate id for ' +
              (this.lastTimestamp - timestamp));
      }
      //如果是同一时间生成的，则进行毫秒内序列
      if (this.lastTimestamp === timestamp) {
          /**
           * 按位于操作 对于每一个比特位，只有两个操作数相应的比特位都是1时，结果才为1，否则为0。
           * 假设最开始 this.sequence 为 0n 加1后，则为1
           */
          this.sequence = (this.sequence + 1n) & this.sequenceMask;
          //毫秒内序列溢出
          if (this.sequence === 0n) {
              //阻塞到下一个毫秒,获得新的时间戳
              timestamp = this.tilNextMillis(this.lastTimestamp);
          }
      } else {
          //时间戳改变，毫秒内序列重置
          this.sequence = 0n;
      }

      //上次生成ID的时间截
      this.lastTimestamp = timestamp;

      //移位并通过或运算拼到一起组成64位的ID
      let result = ((timestamp - this.twepoch) << this.timestampLeftShift) |
          (this.dataCenterId << this.dataCenterIdShift) |
          (this.workerId << this.workerIdShift) |
          this.sequence
      return result;
  };

  /**
   * 阻塞到下一个毫秒，直到获得新的时间戳
   * @param lastTimestamp 上次生成ID的时间截
   * @return 当前时间戳
   */
  Snowflake.prototype.tilNextMillis = function (lastTimestamp) {
      var timestamp = this.timeGen();
      while (timestamp <= lastTimestamp) {
          timestamp = this.timeGen();
      }
      return timestamp;
  };

  /**
   * 返回以毫秒为单位的当前时间
   * @return 当前时间(毫秒)
   */
  Snowflake.prototype.timeGen = function () {
      return BigInt(Date.now());
  };
  return Snowflake;
}());
module.exports =(options)=>{
  return new Snowflake(options.workerId,options.dataCenterId);
};